import { setNavigationBarTitle, showToast, request } from '@tarojs/taro';
import { useCallback, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { ROOT_PATH } from '../../constant';
import Chart from '../../echarts';
import '../style.scss';
/**
 * https://echarts.apache.org/examples/zh/editor.html?c=scatter-nutrients
 */
export default function Index() {
  useEffect(() => {
    setNavigationBarTitle({
      title: '营养分布散点图'
    });
  }, []);
  const getOption = data => {
    return {
      xAxis: {
        name: 'protein',
        splitLine: { show: false }
      },
      yAxis: {
        name: 'calcium',
        splitLine: { show: false }
      },
      visualMap: [
        {
          show: false,
          type: 'piecewise',
          categories: groupCategories,
          dimension: 2,
          inRange: {
            color: groupColors
          },
          outOfRange: {
            color: ['#ccc']
          },
          top: 20,
          textStyle: {
            color: '#fff'
          },
          realtime: false
        },
        {
          show: false,
          dimension: 3,
          max: 100,
          inRange: {
            colorLightness: [0.15, 0.6]
          }
        }
      ],
      series: [
        {
          zlevel: 1,
          name: 'nutrients',
          type: 'scatter',
          data: data.map(function(item, idx) {
            return [item[2], item[3], item[1], idx];
          }),
          animationThreshold: 5000,
          progressiveThreshold: 5000
        }
      ],
      animationEasingUpdate: 'cubicInOut',
      animationDurationUpdate: 2000
    };
  };

  const indices = {
    name: 0,
    group: 1,
    id: 16
  };
  // const schema = [
  //   { name: 'name', index: 0 },
  //   { name: 'group', index: 1 },
  //   { name: 'protein', index: 2 },
  //   { name: 'calcium', index: 3 },
  //   { name: 'sodium', index: 4 },
  //   { name: 'fiber', index: 5 },
  //   { name: 'vitaminc', index: 6 },
  //   { name: 'potassium', index: 7 },
  //   { name: 'carbohydrate', index: 8 },
  //   { name: 'sugars', index: 9 },
  //   { name: 'fat', index: 10 },
  //   { name: 'water', index: 11 },
  //   { name: 'calories', index: 12 },
  //   { name: 'saturated', index: 13 },
  //   { name: 'monounsat', index: 14 },
  //   { name: 'polyunsat', index: 15 },
  //   { name: 'id', index: 16 }
  // ];
  // const fieldIndices = schema.reduce(function (obj, item) {
  //   obj[item.name] = item.index;
  //   return obj;
  // }, {});
  const groupCategories: string[] = [];
  const groupColors: string[] = [];

  // zlevel 为 1 的层开启尾迹特效
  // myChart.getZr().configLayer(1, {
  //   motionBlur: true
  // });
  function normalizeData(originData) {
    let groupMap = {};
    originData.forEach(function(row) {
      let groupName = row[indices.group];
      if (!groupMap.hasOwnProperty(groupName)) {
        groupMap[groupName] = 1;
      }
    });
    originData.forEach(function(row) {
      row.forEach(function(item, index) {
        if (
          index !== indices.name &&
          index !== indices.group &&
          index !== indices.id
        ) {
          // Convert null to zero, as all of them under unit "g".
          row[index] = parseFloat(item) || 0;
        }
      });
    });
    for (let groupName in groupMap) {
      if (groupMap.hasOwnProperty(groupName)) {
        groupCategories.push(groupName);
      }
    }
    let hStep = Math.round(300 / (groupCategories.length - 1));
    for (let i = 0; i < groupCategories.length; i++) {
      groupColors.push(echarts.color.modifyHSL('#5A94DF', hStep * i));
    }
    return originData;
  }

  // let fieldNames = schema
  //   .map(function (item) {
  //     return item.name;
  //   })
  //   .slice(2);
  // app.config = {
  //   xAxis: 'protein',
  //   yAxis: 'calcium',
  //   onChange: function () {
  //     if (data) {
  //       myChart.setOption({
  //         xAxis: {
  //           name: app.config.xAxis
  //         },
  //         yAxis: {
  //           name: app.config.yAxis
  //         },
  //         series: {
  //           data: data.map(function (item, idx) {
  //             return [
  //               item[fieldIndices[app.config.xAxis]],
  //               item[fieldIndices[app.config.yAxis]],
  //               item[1],
  //               idx
  //             ];
  //           })
  //         }
  //       });
  //     }
  //   }
  // };
  // app.configParameters = {
  //   xAxis: {
  //     options: fieldNames
  //   },
  //   yAxis: {
  //     options: fieldNames
  //   }
  // };

  const onInit = useCallback(myChart => {
    myChart.showLoading();
    request({
      url: `${ROOT_PATH}/data/asset/data/nutrients.json`,
      data: {},
      timeout: 9000,
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      fail: err => {
        console.log(err, `${ROOT_PATH}/data/asset/data/nutrients.json`);
        showToast({
          icon: 'none',
          title: '数据请求偶尔会超时，多试几次就好了'
        });
        myChart.hideLoading();
      },
      success: res => {
        console.log(res);
        const data = normalizeData(res?.data).slice(0, 1000);
        myChart.setOption(getOption(data));
        myChart.hideLoading();
      }
    });
  }, []);

  return <Chart option={{}} onSVGInit={onInit} onSkiaInit={onInit} />;
}
