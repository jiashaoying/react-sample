import React, { Component } from 'react'
import Axios from 'axios';
import ReactEcharts from 'echarts-for-react'
import { formatNumber } from '../../../common/js/commonUtils'
import { Table } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import $ from 'jquery'
import '../../../common/css/common.less'
import './home.less'

// 翻译字典
const tabKeyDict = {
  0: "recentWeek",
  1: "recentMonth",
  2: "recentYear",
}
const tabNameDict = {
  0: "最近一周",
  1: "最近一月",
  2: "最近一年",
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      periodSegment: 0,
      strategyTopBarSeries: {},
      strategyTableArray: [],
      strategyReportDate: '',
      hs300BarSeries: [],
      strategyAllArray: [],
    }
    this.handleTabClick = this.handleTabClick.bind(this)
  }
  componentDidMount() {
    const self = this;
    const request1 = this.requestStrategyRangeData()
    Promise.all([request1]).then((results) => {
      if (results[0].length === 0) { // 无数据
        self.setState({
        })
        return
      }
      const strategyDataArray = results[0]
      console.log(strategyDataArray)
      let sortedAllArray = strategyDataArray.sort(this.sortCompareDESC('recentWeek'))
      let top5BarSeries = this.getTopDataSeries(sortedAllArray)
      let hs300Data = {}
      sortedAllArray.forEach((element, index) => {
        if (element.strategyID == '88888') {
          hs300Data = {
            index: index,
            data: element
          }
        }
      })
      let tableArray = [...sortedAllArray]
      tableArray.splice(parseInt(hs300Data.index), 1) // 去除沪深300
      self.setState({ // 数据更新，触发渲染
        strategyAllArray: sortedAllArray,
        strategyReportDate: strategyDataArray[0].endDate,
        periodSegment: 0,
        strategyTableArray: tableArray,
        strategyTopBarSeries: { // 柱状图Bar
          grid: {
            top: '20px',
            left: '0px',
            right: '0px',
            bottom: '30px'
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              interval: 0,
              fontSize: 10,
              formatter: function (value, index) {
                const nameSumCount = value.length
                let disParaName = ''
                const disCharCount = 5
                let rowMaxNum = Math.ceil(nameSumCount / disCharCount)
                if (nameSumCount > disCharCount) {
                  for (let i = 0; i < rowMaxNum; i++) {
                    let tempStr = ''
                    let start = disCharCount * i
                    let end = start + disCharCount
                    if (i == rowMaxNum - 1) {
                      tempStr = value.substring(start, nameSumCount)
                    } else {
                      tempStr = value.substring(start, end) + '\n'
                    }
                    disParaName += tempStr
                  }
                } else {
                  disParaName = value
                }
                return disParaName
              }
            },
            data: top5BarSeries.strategyNames,
          },
          yAxis: {
            type: 'value',
            show: false
          },
          series: [{
            data: top5BarSeries.recentWeek,
            type: 'bar',
            showBackground: false,
            itemStyle: {
              normal: {
                color: function (params) {
                  if (params.value < 0.000001) {
                    let colorList = [
                      '#0c8c75',
                      '#18a464',
                      '#08c770',
                      '#43dc96',
                      '#98e6b2',
                      '#caf0d9',
                    ]
                    return colorList[params.dataIndex]
                  }
                  let colorList = [
                    '#EA6E41',
                    '#EC6A06',
                    '#F39614',
                    '#F8B62B',
                    '#FED641',
                    '#FFEF7A',
                  ]
                  return colorList[params.dataIndex]
                },
                label: {
                  show: true,
                  position: 'top',
                  textStyle: {
                    color: '#333333',
                  },
                  formatter: function (params) {
                    return formatNumber(params.value, 2) + ''
                  }
                },
              }
            },
          }]
        },
      });
    }); // end Promise
  } // end componentDidMount
  // 股票策略信息
  requestStrategyRangeData = () => {
    return new Promise((resolve, reject) => {
      let url = 'http://wechat-h5.shgsec.com/api/stock-analysis/strategies'
      Axios.get(`${url}`).then(response => {
        resolve(response.data)
      }).catch(error => console.log(error))
    })
  }
  getTableColumns() {
    const { periodSegment } = this.state
    return [
      {
        title: '组合名称',
        dataIndex: 'strategyName',
        width: "40%",
        render: function (params) {
          return (<div className="row-name-td"><div className="label-tag"></div><div className="row-name">{params}</div></div>)
        }
      },
      {
        title: tabNameDict[periodSegment + ''] + '(%)',
        dataIndex: tabKeyDict[periodSegment + ''],
        width: "30%",
        render: function (value) {
          return (<span className={value > 0 ? 'zhang' : value < 0 ? 'die' : 'ping'}> {value > 0 ? '+' + formatNumber(value, 2) : formatNumber(value, 2)}
          </span>)
        },
        defaultSortOrder: 'descend',
        sorter: function (obj1, obj2) {
          let sortedKey = tabKeyDict[periodSegment + '']
          return obj1[sortedKey] - obj2[sortedKey]
        },
      },
      {
        title: '累计涨幅(%)',
        dataIndex: 'accumReturn',
        width: "25%",
        render: function (value) {
          return (<span><span className={value > 0 ? 'zhang' : value < 0 ? 'die' : 'ping'}> {value > 0 ? '+' + formatNumber(value, 2) : formatNumber(value, 2)}</span><span><FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: '5px' }}></FontAwesomeIcon></span></span>)
        },
      },
    ];
  }
  // 排序比较函数 升序ASC
  sortCompareASC(key) {
    return (obj1, obj2) => {
      let value1 = obj1[key]
      let value2 = obj2[key]
      if (value1 < value2) {
        return -1;
      } else if (value1 > value2) {
        return 1;
      } else {
        return 0
      }
    }
  }
  sortCompareDESC(key) {
    return (obj1, obj2) => {
      let value1 = obj1[key]
      let value2 = obj2[key]
      if (value1 < value2) {
        return 1;
      } else if (value1 > value2) {
        return -1;
      } else {
        return 0
      }
    }
  }

  getTopDataSeries(sortedArr) {
    let rawArr = [...sortedArr]
    let hs300Data = {}
    sortedArr.forEach((element, index) => {
      if (element.strategyID == '88888') {
        hs300Data = {
          index: index,
          data: element
        }
      }
    })
    rawArr.splice(parseInt(hs300Data.index), 1) // 去除沪深300
    let top5Arr = rawArr.slice(0, 5)
    top5Arr.unshift(hs300Data.data)
    let top5NameArr = []
    let top5WeekRangeArr = []
    let top5MonthRangeArr = []
    let top5YearRangeArr = []
    let top5AccumRangeArr = []
    console.log(top5Arr)
    top5Arr.forEach(element => {
      top5NameArr.push(element.strategyName)
      top5WeekRangeArr.push(element.recentWeek)
      top5MonthRangeArr.push(element.recentMonth)
      top5YearRangeArr.push(element.recentYear)
      top5AccumRangeArr.push(element.accumReturn)
    })
    let retSeries = {
      strategyNames: top5NameArr,
      recentWeek: top5WeekRangeArr,
      recentMonth: top5MonthRangeArr,
      recentYear: top5YearRangeArr,
      accumReturn: top5AccumRangeArr,
    }
    return retSeries
  }
  handleBtnClick(rowModel) {
    console.log(rowModel.strategyID)
    this.props.history.push(`/quant_strategy/detail/${rowModel.strategyID}`);
  }

  handleTabClick(event) {
    event.preventDefault()
    $('#score-tab-ul li').removeClass('li-active');
    $(event.target).addClass('li-active');

    const { strategyAllArray, strategyTableArray } = this.state;
    const index = event.target.dataset.index  // 为string类型
    let sortKey = ''
    switch (parseInt(index)) {
      case 0:
        sortKey = 'recentWeek'
        break
      case 1:
        sortKey = 'recentMonth'
        break
      case 2:
        sortKey = 'recentYear'
        break
      default:
        break
    }
    let sortedAllArray = strategyAllArray.sort(this.sortCompareDESC(sortKey))
    let top5BarSeries = this.getTopDataSeries(sortedAllArray)
    let hs300Data = {}
    sortedAllArray.forEach((element, index) => {
      if (element.strategyID == '88888') {
        hs300Data = {
          index: index,
          data: element
        }
      }
    })
    let tableArray = [...sortedAllArray]
    tableArray.splice(parseInt(hs300Data.index), 1) // 去除沪深300
    this.setState({
      strategyTableArray: tableArray,
      periodSegment: index,
      strategyTopBarSeries: { // 柱状图Bar
        grid: {
          top: '20px',
          left: '0px',
          right: '0px',
          bottom: '30px'
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            interval: 0,
            fontSize: 10,
            formatter: function (value, index) {
              const nameSumCount = value.length
              let disParaName = ''
              const disCharCount = 5
              let rowMaxNum = Math.ceil(nameSumCount / disCharCount)
              if (nameSumCount > disCharCount) {
                for (let i = 0; i < rowMaxNum; i++) {
                  let tempStr = ''
                  let start = disCharCount * i
                  let end = start + disCharCount
                  if (i == rowMaxNum - 1) {
                    tempStr = value.substring(start, nameSumCount)
                  } else {
                    tempStr = value.substring(start, end) + '\n'
                  }
                  disParaName += tempStr
                }
              } else {
                disParaName = value
              }
              return disParaName
            }
          },
          data: top5BarSeries.strategyNames
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: top5BarSeries[sortKey],
          type: 'bar',
          showBackground: false,
          itemStyle: {
            normal: {
              color: function (params) {
                if (params.value < 0.000001) {
                  let colorList = [
                    '#0c8c75',
                    '#18a464',
                    '#08c770',
                    '#43dc96',
                    '#98e6b2',
                    '#caf0d9',
                  ]
                  return colorList[params.dataIndex]
                }
                let colorList = [
                  '#EA6E41',
                  '#EC6A06',
                  '#F39614',
                  '#F8B62B',
                  '#FED641',
                  '#FFEF7A',
                ]
                return colorList[params.dataIndex]
              },
              label: {
                show: true,
                position: 'top',
                textStyle: {
                  color: '#333333',
                },
                formatter: function (params) {
                  return formatNumber(params.value, 2) + ''
                }
              },
            }
          },
        }],
      },
    })
  }

  render() {
    const { periodSegment, strategyTopBarSeries, strategyTableArray, strategyReportDate } = this.state;
    const self = this;
    const columns = this.getTableColumns();
    const getRowKey = function (record) {
      return record.strategyID;
    };
    const onTableRowClick = function (record, event) {
      console.log(record)
      console.log(event)
      self.handleBtnClick(record);
    }
    return (
      <div className="home-mainpart">
        <div className="header-gap">
        </div>
        {/* 这是柱状图📊 */}
        <div className="strategy-bar-section">
          <div className="period-tab">
            <ul id="score-tab-ul">
              <li className="li-active" data-index="0" onClick={this.handleTabClick}>最近一周</li>
              <li data-index="1" onClick={this.handleTabClick}>最近一月</li>
              <li data-index="2" onClick={this.handleTabClick}>最近一年</li>
            </ul>
          </div>
          <div className="header-gap">
            <p>单位：%</p>
          </div>
          <div className="chart-part">
            <ReactEcharts
              option={strategyTopBarSeries}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
        {/* 策略涨幅表格 */}
        <div className="strategy-list">
          <Table dataSource={strategyTableArray} columns={columns} rowKey={record=>getRowKey(record)} onRow={record => {
            return {
              onClick: (event) => {
                onTableRowClick(record, event)
              }
            }
          }} pagination={false}/>
        </div>
        <div className="footer">
          数据统计截止：{strategyReportDate}
          <br />
          本页面所展示的所有过往业绩均不代表未来，敬请知晓本金亏损及收益波动风险。
        </div>
      </div>
    )
  }
}

export default Home;