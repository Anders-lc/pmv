document.addEventListener('DOMContentLoaded', function() {
  var airTemperatureElem = document.getElementById('airTemperature');
  var psValueElem = document.getElementById('psValue')
  var humidityElem = document.getElementById('humidity');
  var paValueElem = document.getElementById('paValue');

  // 根据ps和湿度求人体周围水蒸气分压力pa
  var calcPaValueCallback = function(event) {
    var psValue = psValueElem.innerText;
    if (!psValue) {
      paValue.innerText = 'Error:请先输入温度求得ps值';
      return;
    }
    if (event.target !== humidityElem && !humidityElem.value) {
      paValue.innerText = 'Error:请输入相对湿度';
      return;
    }
    var value = psValue * humidityElem.value / 1000;
    paValueElem.innerText = value;
  };

  // 根据温度求ps
  airTemperatureElem.addEventListener('input', function() {
    var intValue = +this.value;
    var value = Math.exp(intValue * 17.26 / (273.3 + intValue)) * 610.6;
    psValueElem.innerText = value;
  });

  airTemperatureElem.addEventListener('input', calcPaValueCallback);
  humidityElem.addEventListener('input', calcPaValueCallback);

  var clothHeatResistanceElem = document.getElementById('clothHeatResistance');
  var fclValueElem = document.getElementById('fclValue');
  clothHeatResistanceElem.addEventListener('input', function() {
    var value = '';
    if (this.value - 0.078 > 0) {
      value = 1.05 + 0.645 * this.value;
    } else {
      value = 1 + 1.29 * this.value;
    }
    fclValueElem.innerText = value;
  });

  var airVelocityElem = document.getElementById('airVelocity');
  var hcValueElem = document.getElementById('hcValue');
  airVelocityElem.addEventListener('input', function() {
    var value = '';
    if (this.value > 0 && this.value <= 0.15) {
      value = 5.1;
    } else if (this.value > 0.15 && this.value < 1.5) {
      value = 2.7 + 8.7 * Math.pow(this.value, 0.67);
    } else {
      value = 'Error:空气的相对流速区间：(0, 1.5)';
    }
    hcValueElem.innerText = value
  });

  var metabolismRatioElem = document.getElementById('metabolismRatio');
  var mechanicalWorkElem = document.getElementById('mechanicalWork');
  var averageRadiationTemperatureElem = document.getElementById('averageRadiationTemperature');
  var tclValueElem = document.getElementById('tclValue');
  var pmvValueElem = document.getElementById('pmvValue');
  var calcTclValueCb = function() {
    var value = commonCheck();
    if (value) {
      tclValueElem.innerText = value;
      return;
    }
    // 计算分子
    var numeratorPart01 = 35.7;
    var numeratorPart02 = 0.0275 * (metabolismRatioElem.value - mechanicalWorkElem.value);
    var numeratorPart03 = clothHeatResistanceElem.value * fclValue.innerText * (
      4.13 * (1 + 0.01 * (averageRadiationTemperatureElem.value - 20))
      + hcValue.innerText * airTemperature.value
    )
    var numerator = numeratorPart01 - numeratorPart02 + numeratorPart03;
    // 计算分母
    var denominatorPart01 = 1;
    var denominatorPart02 = clothHeatResistanceElem.value * fclValue.innerText * (
      4.13 * (1 + 0.01 * (averageRadiationTemperatureElem.value - 20))
      + hcValue.innerText * 1
    );
    var denominator = denominatorPart01 + denominatorPart02;
    // 计算tcl
    value = numerator / denominator;
    tclValueElem.innerText = value;

    // 计算pmv
    var paValue = paValueElem.innerText;
    var pmvValuePart01 = 0.303 * Math.exp(-0.036 * metabolismRatioElem.value) + 0.0275;
    var pmvValuePart02 = metabolismRatioElem.value;
    var pmvValuePart03 = mechanicalWork.innerText;
    var pmvValuePart04 = 3.05 * (5.733 - 0.007 * (metabolismRatioElem.value - mechanicalWork.innerText) - paValue);
    var pmvValuePart05 = 0.42 * (metabolismRatioElem.value - mechanicalWork.innerText - 58.2);
    var pmvValuePart06 = 0.0173 * metabolismRatioElem.value * (5.867 - paValue);
    var pmvValuePart07 = 0.0014 * metabolismRatioElem.value * (34 - airTemperatureElem.value);
    var pmvValuePart08 = 3.96 * Math.pow(10, -8) * fclValueElem.innerText *
      (
        Math.pow(+(tclValueElem.innerText) + 273, 4)
        - Math.pow(+(averageRadiationTemperature.value) + 273, 4)
      );
    var pmvValuePart09 = fclValueElem.innerText * hcValueElem.innerText * (tclValueElem.innerText - airTemperature.value);
    var pmvValue = pmvValuePart01 * (pmvValuePart02 - pmvValuePart03 - pmvValuePart04 - pmvValuePart05 - pmvValuePart06 - pmvValuePart07 - pmvValuePart08 - pmvValuePart09);
    pmvValueElem.innerText = pmvValue;
  };
  var commonCheck = function (event) {
    if (!airTemperatureElem.value) {
      return 'Error:请输入人体周围空气温度';
    }
    if (!clothHeatResistanceElem.value || !fclValueElem.innerText) {
      return 'Error:请输入服装热阻';
    }
    if (!hcValueElem.innerText || hcValueElem.innerText.indexOf('Error') !== -1) {
      return 'Error:请输入空气的相对流速，或检查其正确性，区间(0, 1.5)';
    }
    if (!metabolismRatioElem.value) {
      return 'Error:请输入人体能量代谢率';
    }
    if (!mechanicalWorkElem.value) {
      return 'Error:请输入人体所做机械功';
    }
    if (!averageRadiationTemperatureElem.value) {
      return 'Error:请输入平均辐射温度';
    }
  };
  airTemperatureElem.addEventListener('input', calcTclValueCb);
  humidityElem.addEventListener('input', calcTclValueCb);
  clothHeatResistanceElem.addEventListener('input', calcTclValueCb);
  airVelocityElem.addEventListener('input', calcTclValueCb);
  metabolismRatioElem.addEventListener('input', calcTclValueCb);
  mechanicalWorkElem.addEventListener('input', calcTclValueCb);
  averageRadiationTemperatureElem.addEventListener('input', calcTclValueCb);
});
