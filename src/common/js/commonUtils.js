/**
* 转换成带中文单位的数据
* value 需转换的值
* decimalDigit 保留的小数位数
*/
export function transferUnit(value, decimalDigit) {
  if (!isNaN(value) && value != '') {
      let result = parseInt(value);
      const len = (result + "").length;
      decimalDigit = decimalDigit ? parseInt(decimalDigit) : 0;
      if (len <= 4) {
          return isNaN(Number(value)) ? value : Number(value).toFixed(decimalDigit);
      } else if (len > 4 && len <= 8) {
          return (result / 10000).toFixed(decimalDigit) + "万";
      } else if (len > 8) {
          return (result / 100000000).toFixed(decimalDigit) + "亿";
      }
  } else {
      return value;
  }
}

/*===================================================================
函数功能:                数字型字符串千分位转换
传入参数:               num：初始值 fixedPoint:截取小数点的位数
====================================================================*/
export function formatNumber(num, fixedPoint) {
  if (num === undefined || isNaN(num) || num === null || num === "") {
      return "";
  }

  fixedPoint = fixedPoint == undefined || fixedPoint == null ? "" : fixedPoint;

  num = (typeof(num) == 'string') ? parseFloat(num) : num;

  if (fixedPoint != "") {

      return (num.toFixed(fixedPoint) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
  } else {

      num += "";

      var point = num.indexOf(".");
      var len = num.length;

      //        数据为整型数          数据为浮点数
      var back = (point == -1) ? "" : num.slice(point - len);

      // 判断符号位
      var sign = num.slice(0, 1);

      point = (point == -1) ? len : point;

      // 为负数,从第二位数字进行千分位转换
      var front = (sign == "-") ? num.slice(1, point) : num.slice(0, point);

      sign = (sign == "-") ? sign : "";

      return sign + (front + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') + back;
  }
}

/*===================================================================
函数功能:                获取当前日期是周几
传入参数:                date 日期
====================================================================*/
export function getWeek(date) {
  date = date ? date : new Date();
  const day = date.getDay();
  let week = "";
  switch(day) {
      case 0:
          week = "周日";
      break;
      case 1:
          week = "周一";
      break;
      case 2:
          week = "周二";
      break;
      case 3:
          week = "周三";
      break;
      case 4:
          week = "周四";
      break;
      case 5:
          week = "周五";
      break;
      case 6:
          week = "周六";
      break;
  }
  return week;
}

/**
* 按降序排列
* @param  {[type]} array  [需要进行排序的数组]
* @param  {[type]} fields [需要进行排序的字段，可以多字段。例：["wtrq", "wtsj"]]
* @return {[type]}        [排序好了的数组]
*/
export function sortDesc(array, fields){
  var getValue = function(obj, fields) {
      var value = "";
      for (var i = 0; i < fields.length; i++) {
          value += obj[fields[i]];
      }
      return value;
  }

  var len = array.length;
  for (var i = 0; i < len; i++) {
      for (var j = 0; j < len - i - 1; j++) {
          var value0 = getValue(array[j], fields);
          var value1 = getValue(array[j + 1], fields);
          if (value0 < value1) {
            var temp = array[j];
            array[j] = array[j + 1];
            array[j + 1] = temp;
          }
      }
  }
  return array;
}

/**
* 数字保留两位小数
* @param  {[int]} x  [需要转成的数字]
*/
export function toDecimal2 (x) {
  const f = Math.round(parseInt(x) * 100) / 100;
  let s = f.toString();
  let rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  
  while (s.length <= rs + 2) {
    s += '0';
  }
  if(x > 0 ) {
    s = '+' + s;
  }  
  return s;    
}
function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

/**
* 获取url参数
* @param {string} key
* @return {string} value
*/
export function getQueryString(key) {
var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
var result = window.location.search.substr(1).match(reg);
return result ? decodeURIComponent(result[2]) : null;
}
