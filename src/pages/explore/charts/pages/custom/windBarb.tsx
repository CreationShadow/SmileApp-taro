import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import Chart from '../../echarts';
import '../style.scss';
/**
https://echarts.apache.org/examples/zh/editor.html?c=wind-barb
 */
const ROOT_PATH = 'https://echarts.apache.org/examples'
export default function windBarb() {
  const [option, setOption] = useState<any>();
  useEffect(() => {
    Taro.request({
      url: 'https://echarts.apache.org/examples/data/asset/data/wind-barb-hobart.json',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        const weatherIcons = {
          Showers: ROOT_PATH + '/data/asset/img/weather/showers_128.png',
          Sunny: ROOT_PATH + '/data/asset/img/weather/sunny_128.png',
          Cloudy: ROOT_PATH + '/data/asset/img/weather/cloudy_128.png'
        };

        const directionMap = {};
        // prettier-ignore
        ['W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE', 'E', 'ENE', 'NE', 'NNE', 'N', 'NNW', 'NW', 'WNW'].forEach(function (name, index) {
            directionMap[name] = Math.PI / 8 * index;
        });
        const data = res.data?.data.map(function (entry) {
          return [entry.time, entry.windSpeed, entry.R, entry.waveHeight];
        });
        const weatherData = res.data?.forecast.map(function (entry) {
          return [
            entry.localDate,
            0,
            weatherIcons[entry.skyIcon],
            entry.minTemp,
            entry.maxTemp
          ];
        });
        const dims = {
          time: 0,
          windSpeed: 1,
          R: 2,
          waveHeight: 3,
          weatherIcon: 2,
          minTemp: 3,
          maxTemp: 4
        };
        const arrowSize = 18;
        const weatherIconSize = 45;
        const renderArrow = function (param, api) {
          const point = api.coord([
            api.value(dims.time),
            api.value(dims.windSpeed)
          ]);
          return {
            type: 'path',
            shape: {
              pathData: 'M31 16l-15-15v9h-26v12h26v9z',
              x: -arrowSize / 2,
              y: -arrowSize / 2,
              width: arrowSize,
              height: arrowSize
            },
            rotation: directionMap[api.value(dims.R)],
            position: point,
            style: api.style({
              stroke: '#555',
              lineWidth: 1
            })
          };
        };
        const renderWeather = function (param, api) {
          const point = api.coord([
            api.value(dims.time) + (3600 * 24 * 1000) / 2,
            0
          ]);
          return {
            type: 'group',
            children: [
              {
                type: 'image',
                style: {
                  image: api.value(dims.weatherIcon),
                  x: -weatherIconSize / 2,
                  y: -weatherIconSize / 2,
                  width: weatherIconSize,
                  height: weatherIconSize
                },
                position: [point[0], 110]
              },
              {
                type: 'text',
                style: {
                  text:
                    api.value(dims.minTemp) + ' - ' + api.value(dims.maxTemp) + '??',
                  textFont: api.font({ fontSize: 14 }),
                  textAlign: 'center',
                  textVerticalAlign: 'bottom'
                },
                position: [point[0], 80]
              }
            ]
          };
        };
        const option = {
          title: {
            text: '?????? ?????? ?????? ?????? ??????',
            subtext: '?????????????????? www.seabreeze.com.au',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              return [
                echarts.format.formatTime(
                  'yyyy-MM-dd',
                  params[0].value[dims.time]
                ) +
                  ' ' +
                  echarts.format.formatTime('hh:mm', params[0].value[dims.time]),
                '?????????' + params[0].value[dims.windSpeed],
                '?????????' + params[0].value[dims.R],
                '?????????' + params[0].value[dims.waveHeight]
              ].join('<br>');
            }
          },
          grid: {
            top: 160,
            bottom: 125
          },
          xAxis: {
            type: 'time',
            maxInterval: 3600 * 1000 * 24,
            splitLine: {
              lineStyle: {
                color: '#ddd'
              }
            }
          },
          yAxis: [
            {
              name: '???????????????',
              nameLocation: 'middle',
              nameGap: 35,
              axisLine: {
                lineStyle: {
                  color: '#666'
                }
              },
              splitLine: {
                lineStyle: {
                  color: '#ddd'
                }
              }
            },
            {
              name: '???????????????',
              nameLocation: 'middle',
              nameGap: 35,
              max: 6,
              axisLine: {
                lineStyle: {
                  color: '#015DD5'
                }
              },
              splitLine: { show: false }
            },
            {
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              splitLine: { show: false }
            }
          ],
          visualMap: {
            type: 'piecewise',
            // show: false,
            orient: 'horizontal',
            left: 'center',
            bottom: 10,
            pieces: [
              {
                gte: 17,
                color: '#18BF12',
                label: '?????????>=17??????'
              },
              {
                gte: 11,
                lt: 17,
                color: '#f4e9a3',
                label: '?????????11  ~ 17 ??????'
              },
              {
                lt: 11,
                color: '#D33C3E',
                label: '??????????????? 11 ??????'
              }
            ],
            seriesIndex: 1,
            dimension: 1
          },
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: 0,
              minSpan: 5
            },
            {
              type: 'slider',
              xAxisIndex: 0,
              minSpan: 5,
              bottom: 50
            }
          ],
          series: [
            {
              type: 'line',
              yAxisIndex: 1,
              showSymbol: false,
              emphasis: {
                scale: false
              },
              symbolSize: 10,
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  global: false,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(88,160,253,1)'
                    },
                    {
                      offset: 0.5,
                      color: 'rgba(88,160,253,0.7)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(88,160,253,0)'
                    }
                  ]
                }
              },
              lineStyle: {
                color: 'rgba(88,160,253,1)'
              },
              itemStyle: {
                color: 'rgba(88,160,253,1)'
              },
              encode: {
                x: dims.time,
                y: dims.waveHeight
              },
              data: data,
              z: 2
            },
            {
              type: 'custom',
              renderItem: renderArrow,
              encode: {
                x: dims.time,
                y: dims.windSpeed
              },
              data: data,
              z: 10
            },
            {
              type: 'line',
              symbol: 'none',
              encode: {
                x: dims.time,
                y: dims.windSpeed
              },
              lineStyle: {
                color: '#aaa',
                type: 'dotted'
              },
              data: data,
              z: 1
            },
            {
              type: 'custom',
              renderItem: renderWeather,
              data: weatherData,
              tooltip: {
                trigger: 'item',
                formatter: function (param) {
                  return (
                    param.value[dims.time] +
                    ': ' +
                    param.value[dims.minTemp] +
                    ' - ' +
                    param.value[dims.maxTemp] +
                    '??'
                  );
                }
              },
              yAxisIndex: 2,
              z: 11
            }
          ]
        };
        setOption(option)

      },
      fail: err => {
        console.log(err);
        Taro.showToast({
          icon: 'none',
          title: '??????????????????'
        });
      }
    });
  }, []);
  return option ? (
    <View>
      <View className="header">?????????</View>
      <View className="body">
        <Chart option={option} />
      </View>
    </View>
  ) : (
    <View>Loading...</View>
  );
}
