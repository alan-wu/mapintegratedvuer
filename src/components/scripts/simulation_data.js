let minF = undefined;
let maxF = undefined;
let minVol = undefined;
let maxVol = undefined;

const fvData = {
  "compartments": [
      {
          "flow": 0.049699,
          "name": "RUL Anterior",
          "number": 1,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 181987.21791976015
              },
              {
                  "time": 3.0,
                  "volume": 190654.20796455297
              },
              {
                  "time": 5.0,
                  "volume": 197903.5873118482
              }
          ]
      },
      {
          "flow": 0.0612,
          "name": "RUL Posterior",
          "number": 2,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 201042.2999957783
              },
              {
                  "time": 3.0,
                  "volume": 223166.3550326552
              },
              {
                  "time": 5.0,
                  "volume": 224107.48977724495
              }
          ]
      },
      {
          "flow": 0.082407,
          "name": "RUL Apical",
          "number": 3,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 245471.83628595909
              },
              {
                  "time": 3.0,
                  "volume": 257765.65591976934
              },
              {
                  "time": 5.0,
                  "volume": 268162.69688902283
              }
          ]
      },
      {
          "flow": 0.046921,
          "name": "RML Lateral",
          "number": 4,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 136749.2302777965
              },
              {
                  "time": 3.0,
                  "volume": 142354.54619401656
              },
              {
                  "time": 5.0,
                  "volume": 144871.90605963918
              }
          ]
      },
      {
          "flow": 0.041519,
          "name": "RML Medial",
          "number": 5,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 149373.3982901215
              },
              {
                  "time": 3.0,
                  "volume": 157328.6444732329
              },
              {
                  "time": 5.0,
                  "volume": 158140.25438088493
              }
          ]
      },
      {
          "flow": 0.063307,
          "name": "RLL Posterior",
          "number": 6,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 186775.46800209297
              },
              {
                  "time": 3.0,
                  "volume": 192966.52104661157
              },
              {
                  "time": 5.0,
                  "volume": 205857.97557974615
              }
          ]
      },
      {
          "flow": 0.065394,
          "name": "RLL Medial",
          "number": 7,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 194824.7466953374
              },
              {
                  "time": 3.0,
                  "volume": 217874.6619392152
              },
              {
                  "time": 5.0,
                  "volume": 217381.52321902165
              }
          ]
      },
      {
          "flow": 0.056798,
          "name": "RLL Anterior",
          "number": 8,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 215680.0182455645
              },
              {
                  "time": 3.0,
                  "volume": 219453.77944698493
              },
              {
                  "time": 5.0,
                  "volume": 231581.60138050313
              }
          ]
      },
      {
          "flow": 0.081373,
          "name": "RLL Superior",
          "number": 9,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 244625.5581985565
              },
              {
                  "time": 3.0,
                  "volume": 266792.0850557373
              },
              {
                  "time": 5.0,
                  "volume": 284087.3333850801
              }
          ]
      },
      {
          "flow": 0.056684,
          "name": "LUL Posterior",
          "number": 10,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 172196.7437707655
              },
              {
                  "time": 3.0,
                  "volume": 181443.25253755006
              },
              {
                  "time": 5.0,
                  "volume": 191012.60480114556
              }
          ]
      },
      {
          "flow": 0.038741,
          "name": "LUL Anterior",
          "number": 11,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 167290.43470213015
              },
              {
                  "time": 3.0,
                  "volume": 181601.44836610503
              },
              {
                  "time": 5.0,
                  "volume": 186127.32231959977
              }
          ]
      },
      {
          "flow": 0.038449,
          "name": "LUL Lingular",
          "number": 12,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 141906.787889736
              },
              {
                  "time": 3.0,
                  "volume": 141671.55047498783
              },
              {
                  "time": 5.0,
                  "volume": 152307.21920357717
              }
          ]
      },
      {
          "flow": 0.055762,
          "name": "LUL Apical",
          "number": 13,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 218466.22444789423
              },
              {
                  "time": 3.0,
                  "volume": 251686.08493242075
              },
              {
                  "time": 5.0,
                  "volume": 250175.1790429858
              }
          ]
      },
      {
          "flow": 0.045985,
          "name": "LLL Posterior",
          "number": 14,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 138039.9756600753
              },
              {
                  "time": 3.0,
                  "volume": 137909.5791278306
              },
              {
                  "time": 5.0,
                  "volume": 160653.0149818861
              }
          ]
      },
      {
          "flow": 0.057459,
          "name": "LLL Superior",
          "number": 15,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 193934.96452631807
              },
              {
                  "time": 3.0,
                  "volume": 218445.44410386705
              },
              {
                  "time": 5.0,
                  "volume": 220963.58880308812
              }
          ]
      },
      {
          "flow": 0.053836,
          "name": "LLL Medial",
          "number": 16,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 201521.12178046367
              },
              {
                  "time": 3.0,
                  "volume": 233287.44183763085
              },
              {
                  "time": 5.0,
                  "volume": 203887.33003463238
              }
          ]
      },
      {
          "flow": 0.051704,
          "name": "LLL Anterior",
          "number": 17,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 188226.65055088204
              },
              {
                  "time": 3.0,
                  "volume": 189234.8102624248
              },
              {
                  "time": 5.0,
                  "volume": 211763.78024920568
              }
          ]
      },
      {
          "flow": 0.052762,
          "name": "LLL Lateral",
          "number": 18,
          "volumes": [
              {
                  "time": 1.0,
                  "volume": 157340.55375980627
              },
              {
                  "time": 3.0,
                  "volume": 160912.90618797182
              },
              {
                  "time": 5.0,
                  "volume": 193000.8440869187
              }
          ]
      }
  ],
  "left lung": {
      "flow": 0.45138,
      "sum compartment flow": 0.45138199999999995,
      "volumes": [
          {
              "sum compartment volume": 1578923.4570880714,
              "time": 1.0,
              "volume": 3335453.2309989794
          },
          {
              "sum compartment volume": 1696192.517830789,
              "time": 3.0,
              "volume": 3564548.974903552
          },
          {
              "sum compartment volume": 1769890.8835230393,
              "time": 5.0,
              "volume": 3701985.251506051
          }
      ]
  },
  "right lung": {
      "flow": 0.54862,
      "sum compartment flow": 0.5486179999999999,
      "volumes": [
          {
              "sum compartment volume": 1756529.773910967,
              "time": 1.0,
              "volume": 3335453.2309989794
          },
          {
              "sum compartment volume": 1868356.4570727758,
              "time": 3.0,
              "volume": 3564548.974903552
          },
          {
              "sum compartment volume": 1932094.367982991,
              "time": 5.0,
              "volume": 3701985.251506051
          }
      ]
  }
}

const getFlowAndVolume = (compartment, time) => {
  if (compartment) {
    const entry = fvData.compartments.find(
      element => element.name === compartment);
    if (!entry) return {};

    const min = 1.0, max = 5.0;
    const range = max - min;
    const nT = time / 100.0 * range + min;
    const v3 = entry.volumes.find(element => element.time === 3.0);
    let volume = 0;
    const flow = entry.flow;
    if (1.0 <= nT && nT <= 3.0) {
      const v1 = entry.volumes.find(element => element.time === 1.0);
      const ratio = (nT - 1.0) / 2.0;
      volume = (1.0 - ratio) * v1.volume + ratio * v3.volume;
    } else {
      const v5 = entry.volumes.find(element => element.time === 5.0);
      const ratio = (nT - 3.0) / 2.0;
      volume = (1.0 - ratio) * v3.volume + ratio * v5.volume;
    }

    return { flow, volume };
  }
}

const calculateMinMax = () => {
  if (minVol === undefined) {
    fvData.compartments.forEach((ele) => {
      const vol = ele.volumes.find(v => v.time === 1.0).volume;
      const flow = ele.flow;
      console.log(vol, flow)
      if (minVol === undefined || vol < minVol) {
        minVol = vol;
      }
      if (maxVol === undefined || vol > maxVol) {
        maxVol = vol;
      }
      if (minF === undefined || flow < minF) {
        minF = flow;
      }
      if (maxF === undefined || flow > maxF) {
        maxF = flow;
      }
    })
  }
}

const getMockData = (compartment) => {
  if (compartment) {
    const entry = fvData.compartments.find(
      element => element.name === compartment);
    if (!entry) return {};
    calculateMinMax();
    const vol = entry.volumes.find(v => v.time === 1.0).volume;
    const flow = entry.flow;
    const i = (vol - minVol) / (maxVol - minVol) * 9 + 1;
    const e = (flow - minF) / (maxF - minF) * 9 + 1;

    return { "Inspiration time": i, "Expiration time": e };
  }
}

export {
  getFlowAndVolume,
  getMockData,
}
