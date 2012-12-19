var e_colour_scheme = ['#edc240', '#afd8f8', '#cb4b4b', '#4da74d', '#9440ed'];

$e.plot = function($container, type, data) {
  switch (type) {
    case 'vs_predicted_mean_plot':
      $e.plotVsPredicted($container, data, 'mean');
      break;
    case 'vs_predicted_median_plot':
      $e.plotVsPredicted($container, data, 'median');
      break;
    case 'standard_score_plot':
      $e.plotStandardScore($container, data);
      break;
    case 'mean_residual_histogram':
      $e.plotResidualHistogram($container, data, 'mean');
      break;
    case 'mean_residual_qq_plot':
      $e.plotResidualQQ($container, data, 'mean');
      break;
    case 'median_residual_histogram':
      $e.plotResidualHistogram($container, data, 'median');
      break;
    case 'median_residual_qq_plot':
      $e.plotResidualQQ($container, data, 'median');
      break;
    case 'rank_histogram':
      $e.plotHistogram($container, data, {
        xAxisLabel: 'Realisation number',
        yAxisLabel: 'Frequency of observation in that realisation'
      });
      break;
    case 'reliability_diagram':
      $e.plotReliabilityDiagram($container, data);
      break;
    case 'coverage_plot':
      $e.plotCoverage($container, data);
      break;
    default:
      $container.html('Unsupported plot type ' + type + '.');
  }
}

$e.baseParse = function(data) {
  // parse data
  var x = data.x;
  var y = data.y;
  var array = [];
  for (var i = 0; i < x.length; i++) {
    array.push([x[i], y[i]]);
  }
  return array;
};

$e.calculateMinMax = function(data) {
  var minX;
  var maxX;
  var minY;
  var maxX;
  for (var i = 0; i < data.x.length; i++) {
    if (i == 0 || data.x[i] < minX) {
      minX = data.x[i];
    }
    if (i == 0 || data.x[i] > maxX) {
      maxX = data.x[i];
    }
    if (i == 0 || data.y[i] < minY) {
      minY = data.y[i];
    }
    if (i == 0 || data.y[i] > maxY) {
      maxY = data.y[i];
    }
  }
  return {
    min: (minX < minY ? minX : minY),
    max: (maxX > maxY ? maxX : maxY),
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY };
};

$e.createBackgroundLine = function(data) {
  var l = {
    label: 'r',
    data: data,
    lines: { show: true },
    color: e_colour_scheme[1],
    hoverable: false };
  return l;
};

$e.createPoints = function(data) {
  var p = {
    label: 'k+',
    data: data,
    points: { show: true, radius: 4 },
    color: e_colour_scheme[0] };
  return p;
}

$e.basePlot = function($container, data, options, title, formatter) {
  var merged = $.extend({}, {
    colors: e_colour_scheme,
    grid: {
      borderWidth: 0,
      hoverable: true
    },
    legend: {
      show: false
    }
  }, options);

  var $plotarea;
  if (typeof(title) !== 'undefined' && title != null) {
    var height = $container.height();
    $container.empty();
    $heading = $('<div>' + title + '</div>').addClass('plot-title').appendTo($container);
    $plotarea = $('<div></div>').css('height', height - $heading.height()).appendTo($container);
  } else {
    $plotarea = $container;
  }
  var plot = $.plot($plotarea, data, merged);

  $plotarea.bind('plothover', function(event, position, item) {
    if (item) {
      if (plot.previousPoint != item.dataIndex) {
        plot.previousPoint = item.dataIndex;

        // remove old tooltip
        $('#plot-tooltip').remove();

        // default formatter if required
        var format = formatter;
        if (typeof(format) === 'undefined' || format == null) {
          format = function($div, item) {
            var datapoint = item.datapoint;
            $div.html('x: ' + datapoint[0].toFixed(2) + ', ' + 'y: ' + datapoint[1].toFixed(2));
          }
        }

        // create new tooltip
        $tooltip = $('<div id="plot-tooltip" class="plot-tooltip"></div>').appendTo('body');

        // format it
        format($tooltip, item);

        // calculate position
        var left = item.pageX + 12;
        var top = item.pageY;
        // if (left + $tooltip.width() > $(window).width()) {
        //   left = position.pageX - offset - $tooltip.width();
        // } else {
        //   left = left + offset;
        // }

        // set position
        $tooltip.css({ left: left, top: top });
        $tooltip.css('border-color', item.series.color);

        // and show it
        $tooltip.fadeIn();
      }
    } else {
      plot.previousPoint = null;
      $('#plot-tooltip').fadeOut('fast', function() {
        $(this).remove();
      });
    }
  });

  return plot;
};

$e.plotHistogram = function($container, data, options) {
  var merged = $.extend({}, {
    xAxisLabel: 'X',
    yAxisLabel: 'Y'
  }, options);

  // create data
  var minMax = $e.calculateMinMax(data);
  var barWidth = ((minMax.maxX - minMax.minX) * 0.6) / data.x.length
  var pdata = [
    { label: 'k+',
      data: $e.baseParse(data),
      bars: { show: true, align: 'center', barWidth: barWidth } }
  ];

  // x = 70 / 30

  // create options
  var options = {
    xaxes: [{
      axisLabel: merged.xAxisLabel
    }],
    yaxes: [{
      axisLabel: merged.yAxisLabel
    }]
  };

  $e.basePlot($container, pdata, options);
};

$e.plotVsPredicted = function($container, data, source) {
  // create data
  var minMax = $e.calculateMinMax(data);
  var pdata = [
    $e.createBackgroundLine([[minMax.min,minMax.min],[minMax.max,minMax.max]]),
    $e.createPoints($e.baseParse(data))
  ];

  // create options
  var options = {
    xaxes: [{ axisLabel: 'Observed' }],
    yaxes: [{ axisLabel: 'Predicted ' + source }]
  };

  $e.basePlot($container, pdata, options);
};

$e.plotStandardScore = function($container, data) {
  // create data
  var pdata = [
    $e.createBackgroundLine([[0,2],[data.x.length - 1,2]]),
    $e.createBackgroundLine([[0,-2],[data.x.length - 1,-2]]),
    $e.createPoints($e.baseParse(data))
  ];

  // create options
  var options = {
    yaxis: { min: -4, max: 4 },
    xaxes: [{
      axisLabel: 'Index of observation in data set'
    }],
    yaxes: [{
      axisLabel: 'Standard score',
    }]
  };

  var formatter = function($div, item) {
    $div.html(item.datapoint[1].toFixed(2));
  };

  $e.basePlot($container, pdata, options, null, formatter);
};

$e.plotResidualHistogram = function($container, data, source) {
  $e.plotHistogram($container, data, {
    xAxisLabel: 'Residual from the ' + source,
    yAxisLabel: 'Frequency'
  });
};

$e.plotReliabilityDiagram = function($container, data) {
  // create data
  var pdata = [
    $e.createBackgroundLine([[0,0],[1,1]]),
    $e.createPoints($e.baseParse(data))
  ];
      
  // create options
  var options = {
    yaxis: { min: 0, max: 1 },
    xaxes: [{
      axisLabel: 'Forecast probability'
    }],
    yaxes: [{
      axisLabel: 'Observed frequency',
    }]
  };

  var plot = $e.basePlot($container, pdata, options);

  // add data labels
  $.each(pdata[1].data, function(i, xy) {
    var offset = plot.pointOffset({ x: xy[0], y: xy[1] });
    var $label = $('<div class="plot-label"></div>');
    $label.html(data.n[i]); // lookup from original data
    $label.css({ left: offset.left + 8, top: offset.top });
    $label.appendTo(plot.getPlaceholder());
  });
};

$e.plotResidualQQ = function($container, data, source) {
  // create data
  var minMax = $e.calculateMinMax(data);
  var pdata = [
    $e.createBackgroundLine([[minMax.min,minMax.min],[minMax.max,minMax.max]]),
    $e.createPoints($e.baseParse(data))
  ];

  // create options
  var options = {
    xaxis: { min: minMax.min, max: minMax.max },
    yaxis: { min: minMax.min, max: minMax.max },
    xaxes: [{
      axisLabel: 'Observed residual quantiles'
    }],
    yaxes: [{
      axisLabel: 'Predicted ' + source + ' residual quantiles',
    }]
  };

  $e.basePlot($container, pdata, options);
};

$e.plotCoverage = function($container, data) {
  // create data
  var pdata = [
    $e.createBackgroundLine([[20,20],[98,98]]),
    $e.createPoints($e.baseParse(data))
  ];

  // create options
  var options = {
    xaxis: { min: 20, max: 100 },
    yaxis: { min: 0, max: 100 },
    xaxes: [{ axisLabel: 'Theoretical coverage' }],
    yaxes: [{ axisLabel: 'Observed frequency in coverage interval' }]
  };

  $e.basePlot($container, pdata, options);
};
