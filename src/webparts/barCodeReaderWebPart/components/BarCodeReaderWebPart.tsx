import * as React from 'react';
import styles from './BarCodeReaderWebPart.module.scss';
import { IBarCodeReaderWebPartProps } from './IBarCodeReaderWebPartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import Quagga from 'quagga';

export default class BarCodeReaderWebPart extends React.Component<IBarCodeReaderWebPartProps, {}> {

  public componentDidMount() {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#liveStreamElement'),
        constraints: {
          width: 320,
          height: 240,
          facingMode: "environment"
        }
      },
      locator: {
        patchSize: "x-large",
        halfSample: true
      },
      locate: true,
      decoder: {
        readers: ["code_128_reader"]
      }
    }, (err) => {
      if (err) {
        return true;
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
      Quagga.onProcessed((result) => {
        var drawingCtx = Quagga.canvas.ctx.overlay,
          drawingCanvas = Quagga.canvas.dom.overlay;
        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
            result.boxes.filter((box) => {
              return box !== result.box;
            }).forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
            });
          }
          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
          }
          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
          }
        }
      });
    });
    Quagga.onDetected((val) => {
      alert(val.codeResult.code);
    });
  }

  public render(): React.ReactElement<IBarCodeReaderWebPartProps> {
    return (
      <div className={styles.barCodeReaderWebPart}>
        <div className={styles.container}>
          <div className={styles.row}>
            <button className={styles.button} onClick={() => { Quagga.stop(); }} >Stop Scanning</button>
          </div>
          <div className={styles.row}>
            <div className={styles.column}>
              <div id="liveStreamElement"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
