
/**
 *
 * 主函数
 *
 * @param {!DOM} dom 要 awesome 的 card 的 dom，选择器不支持，jquery不支持，zepto不支持
 * @param {!Object} config 配置参数
 *
 * @param {!String} config.transCenterX eg:'50%', 压感的中心X轴，如果是移动端这个参数不考虑。
 * @param {!String} config.transCenterY eg:'50%', 压感的中心Y轴，如果是移动端这个参数不考虑。
 * @param {Boolean} config.isPC eg:true, false的话就是移动端，会通过陀螺仪去awesome起来。
 * @param {String} config.activeClass eg:'active', 当 card awesome 起来的时候，class会被添加到dom上
 * @param {Function} config.getParamX eg: ()=>0.00005 这个函数可以动态的配置X方向参数，这个参数直接影响了运动的幅度，建议你从0.00005开始体验
 * @param {Function} config.getParamY eg: ()=>0.00005 这个函数可以动态的配置Y方向参数，这个参数直接影响了运动的幅度，建议你从0.00005开始体验
 *
 */
var awesomeCard = function (dom, config) {
  function isDOMA(obj) {
    return obj instanceof HTMLElement;
  }

  function isDOMB(obj) {
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
  }
  var isDOM = (typeof HTMLElement === 'object') ? isDOMA : isDOMB;

  if (!isDOM(dom)) {
    throw new Error('you are passing something not a dom, shutting down!');
  }

  var defaultConfig = {
    transCenterX: '50%',
    transCenterY: '50%',
    attachToMouseEvent: true,
    activeClass: null,
    getParamX: function () {
      return 0.00005;
    },
    getParamY: function () {
      return 0.00005;
    }
  };

  defaultConfig.activeClass = config.activeClass;
  defaultConfig.attachToMouseEvent = typeof config.isPC === undefined ? defaultConfig.attachToMouseEvent : config.isPC;

  defaultConfig.getParamX = config.getParamX || defaultConfig.getParamX;
  defaultConfig.getParamY = config.getParamY || defaultConfig.getParamY;

  function percentToFloat($) {
    if ($.indexOf('%') > 0) {
      return parseFloat($.substring(0, $.indexOf('%')), 10) / 100;
    } else {
      return 0.5;
    }
  }

  defaultConfig.transCenterX = percentToFloat(defaultConfig.transCenterX);
  defaultConfig.transCenterY = percentToFloat(defaultConfig.transCenterY);

  function animation(dom, ex, ey) {
    var matrix;
    if (ex === null && ey === null) {
      matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 1],
        [0, 0, 0, 1]
      ];
      dom.style.transform = 'matrix3d(' + matrix.toString() + ')';
      if (defaultConfig.activeClass && dom.className.indexOf(defaultConfig.activeClass) >= 0) {
        var classlist = dom.className.split(' ');
        classlist.splice(classlist.indexOf(defaultConfig.activeClass), 1);
        dom.className = classlist.join(' ');
      }
    } else {
      if (!(defaultConfig.activeClass && dom.className.indexOf(defaultConfig.activeClass) >= 0)) {
        dom.className += ' ' + defaultConfig.activeClass;
      }
      var x = (ex - defaultConfig.transCenterX * dom.offsetWidth) / dom.offsetWidth;
      var y = (ey - defaultConfig.transCenterY * dom.offsetHeight) / dom.offsetHeight;
      matrix = [
        [1, 0, 0, x * defaultConfig.getParamX()],
        [0, 1, 0, y * defaultConfig.getParamY()],
        [0, 0, 1, 1],
        [0, 0, 0, 1]
      ];
      dom.style.transform = 'matrix3d(' + matrix.toString() + ')';
    }
  }

  function attechMouseMove(dom) {
    document.addEventListener('mousemove', function (e) {
      var X = e.pageX - dom.offsetLeft;
      if (X < 0 || X > dom.offsetWidth) {
        return animation(dom, null, null);
      }
      var Y = e.pageY - dom.offsetTop;
      if (Y < 0 || Y > dom.offsetHeight) {
        return animation(dom, null, null);
      }
      animation(dom, X, Y);
    });
  }

  function animationOrigin(dom, gamma, beta) {
    var matrix;

    if (!(defaultConfig.activeClass && dom.className.indexOf(defaultConfig.activeClass) >= 0)) {
      dom.className += ' ' + defaultConfig.activeClass;
    }
    var x = (gamma) / dom.offsetWidth;
    var y = (beta) / dom.offsetHeight;
    matrix = [
      [1, 0, 0, x * defaultConfig.getParamX()],
      [0, 1, 0, y * defaultConfig.getParamY()],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ];
    dom.style.transform = 'matrix3d(' + matrix.toString() + ')';
  }

  function attechDeviceOrientation(dom) {
    var oy, oz;

    function degToDis(deg) {
      return Math.sqrt(Math.abs(deg)) * (deg > 0 ? 1 : -1) * 100;
    }
    window.addEventListener('deviceorientation', function (event) {
      if (!oy) {
        oy = event.beta;
        oz = event.gamma;
      }
      var y = event.beta - oy;
      var z = event.gamma - oz;

      animationOrigin(dom, degToDis(-z), degToDis(-y));
      console.log(degToDis(-z), degToDis(-y));
    }, true);
  }

  if (defaultConfig.attachToMouseEvent) {
    attechMouseMove(dom);
  } else {
    attechDeviceOrientation(dom);
  }
};

//module.exports = awesomeCard;

