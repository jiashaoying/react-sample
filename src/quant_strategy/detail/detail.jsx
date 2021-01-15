import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactEcharts from 'echarts-for-react'
import Echarts from 'echarts';
import { formatNumber } from '../../../js/kmc-commonUtils'
import { getQueryString } from '../../../js/kmc-commonUtils'
import $ from 'jquery'
import '../../../kmc/src/css/kmc-common'
import './detail.less'

let refresh = true;
let context = null;
//分享，原生调用H5方法
window.jumpToShareH5 = function () {

}

//设置股票代码，原生向H5传递参数
window.setLocalStockCode = function (stockCode) {

}

/**
* 函数功能： 程序退至后台时运行
*/
window.onPause = function () {
  console.log("onPause调用了");
  refresh = false;
}

/**
* 函数功能： 程序切回加载时运行
*/
window.onResume = function () {
  console.log("onResume调用了");
  refresh = true;
  if (context != null) {
    context.componentDidMount();
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strategyReportResult: [],
      hs300YieldData: [],
      strategyYieldData: [],
      xAxisData: [],
      strategyReportDate: '',
      strategyDetailData: '',
      hs300Name: '',
      strategyName: ''
    }
  }

  handleConfirm() {
    this.refs.confirmDialog.hide();
  }
  componentDidMount() {
    context = this;
    const self = this;
    let strategyID = getQueryString('strategyID')
    const request1 = this.requestStrategyDetailData(strategyID)
    Promise.all([request1]).then((results) => {
      console.log(results[0].strategy)
      if (results[0].strategy == undefined) { // 无数据
        self.setState({
        })
        return
      }
      let strategyReportResult = results[0]
      document.title = strategyReportResult.strategy.strategyName
      // 解析数据
      let xAxisNameData = []
      let hs300YieldData = []
      let strategyYieldData = []
      for (const item of strategyReportResult.netWorth) {
        xAxisNameData.push(item.tradeDate)
        hs300YieldData.push(item.benchmark)
        strategyYieldData.push(item.jingzhi)
      }
      // 数据更新，触发渲染
      self.setState({
        strategyReportDate: strategyReportResult.strategy.endDate,
        hs300YieldData: hs300YieldData,
        strategyYieldData: strategyYieldData,
        xAxisData: xAxisNameData,
        strategyDetailData: strategyReportResult.strategy,
        hs300Name: '沪深300',
        strategyName: strategyReportResult.strategy.strategyName,
      })
    }) // end Promise
  } // end componentDidMount

  requestStrategyDetailData = (param) => {
    return new Promise((resolve, reject) => {
      let url = `http://wechat-h5.shgsec.com/api/stock-analysis/strategies/${param}`
      $.get(url, response => {
        resolve(response)
      })
    })
  }

  getLineChartOption(xAxisData, yAxisData1, yAxisData2) {
    const { hs300Name,strategyName } = this.state;
    let option = {
      tooltip: {
        show: true,
        trigger: 'axis',
        // formatter: '{a0} :{c0}<br />{a1}:{c1}%',
      },
      toolbox: {
        show: false
      },
      legend: {
        data: [strategyName, hs300Name],
        textStyle: {
          fontSize: 12
        },
        top: '10px',
        left: 'left',
        selectedMode: false
      },
      grid: {
        show: false,
        top: '60px',
        left: 'auto',
        right: 'auto',
        bottom: '20px',
        height: 'auto',
        // containLabel: true
      },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        show: false,
        type: 'value',
        axisLabel: {  
          inside: true,
          interval: 'auto',  
          // formatter: '{value} %'  
        },
        min: function(value) {
          return value.min
        },
        max: function(value) {
          return value.max
        },
        splitLine: {
          lineStyle: {
            type: 'dotted'
          }
        }
      },
      series: [
        {
          name: strategyName,
          type: 'line',
          data: yAxisData2,
          symbol: 'none',
          smooth: false,
          itemStyle: {
            color: '#E83428'
          },
          // areaStyle: {
          //   color: new Echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          //     offset: 0,
          //     color: '#EA7E77'
          //   }, {
          //     offset: 0.2,
          //     color: '#EDD4D3'
          //   }, {
          //     offset: 1,
          //     color: '#F6F7F7'
          //   }])
          // },
        },
        {
          name: '沪深300',
          type: 'line',
          data: yAxisData1,
          symbol: 'none',
          smooth: false,
          itemStyle: {
            color: '#0D6FB8'
          },
          // areaStyle: {
          //   color: new Echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          //     offset: 0,
          //     color: '#3182C0'
          //   }, {
          //     offset: 0.3,
          //     color: '#D2DAE5'
          //   }, {
          //     offset: 1,
          //     color: '#F6F7F7'
          //   }])
          // },
        }
      ]
    };
    return option;
  }
  // 获取拼装图线数据
  getData(rate) {
    let res = [];
    let res1 = [];
    rate.forEach((value, index) => {
      res.push(value.init_date);
      res1.push(Math.round(value.income_rate * 10000) / 100)
    })
    return [res, res1];
  }
  getCSSCodeSegment(value) {
    if (value == undefined) {
      return <span></span>
    }
    if (value > 0.0000001) {
      return (<span className="up"> {'+' + formatNumber(value, 2)}</span>)
    } else if (value < -0.000001) {
      return (<span className="down"> {formatNumber(value, 2)}</span>)
    } else {
      return (<span className="same"> {formatNumber(value, 2)}</span>)
    }
    
  }
  render() {
    const { hs300YieldData, strategyYieldData, xAxisData, strategyReportDate, strategyDetailData } = this.state;
    const self = this;
    return (
      <div className="detail-mainpart">
        <div className="introduction-section">
          <p className="stra-title">策略介绍：</p>
    <p className="des-content">{strategyDetailData.intro}</p>
        </div>
        <div className="div-separate"></div>
        <div className="adviser-info">
          <div className="intro-text">
            <p>详询我司投资顾问或<br />拨打<span className="phone-number">021-80229999</span></p>
          </div>
          <div className="intro-image">
            <img src="../img/customer.png" alt="" />
          </div>
        </div>
        <div className="div-separate"></div>
        <div className="strategy-rate-table">
          <table className="rate-table">
            <tbody>
              <tr>
                <td className="column-title">最近一周(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.recentWeek)}</td>
              </tr>
              <tr>
                <td className="column-title">最近一月(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.recentMonth)}</td>
              </tr>
              <tr>
                <td className="column-title">最近一年(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.recentYear)}</td>
              </tr>
              <tr>
                <td className="column-title">累计收益率(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.accumReturn)}</td>
              </tr>
              <tr>
                <td className="column-title">同期沪深300收益率(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.hs300)}</td>
              </tr>
              <tr>
                <td className="column-title">最大回撤(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.maxDown)}</td>
              </tr>
              <tr>
                <td className="column-title">年化收益率(%)</td>
                <td className="column-value">{this.getCSSCodeSegment(strategyDetailData.annualReturn)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="chart-section">
          <ReactEcharts 
            className="ReactEcharts"
            option={this.getLineChartOption(xAxisData, hs300YieldData, strategyYieldData)}
            style={{ height: '180px' }}
            opts={{ renderer: 'svg' }}
          />
          <div className="chart-tips">
            数据统计截止：{strategyReportDate}
            <br />
            本页面所展示的所有过往业绩均不代表未来，敬请知晓本金亏损及收益波动风险。
            </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Home />, document.getElementById("strategy-detail-main"));
