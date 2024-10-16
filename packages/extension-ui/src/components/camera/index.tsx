// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactElement } from 'react';

import { Col, Spin } from 'antd';
import Axios from 'axios';
// import FaceCam from "./FaceCam";
// import { useWebcamContext } from "../../hooks/useWebCam";
import * as faceapi from 'face-api.js';
import _debounce from 'lodash/debounce';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import { WebCamContext } from '../../context/webcam';
import { useToast } from '../../hooks/index.js';
// import ReactBodymovin from "react-bodymovin";
import { AnimationWrapper } from './cam.style';

// import animation from "../../util/data/bodymovin-animation.json"

interface Props {
  setCessAddr: (address: string, mnemonic: string) => void;
}

const CameraComp: React.FC<Props> = ({ setCessAddr }): ReactElement => {
  const { show } = useToast();
  const { WebcamStarted, resolution, setIsDetected, setWebCamRef,
    setWebcamStarted } = useContext(WebCamContext); // Ensure useWebcamContext returns correctly typed values

  const { height, width } = resolution;

  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalId = useRef<number | null>(null);

  const [selectButton, setSelectButton] = useState<string | null>(null);
  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [isEnrollSpinActive, setEnrollSpinActive] = useState<boolean>(false);
  const [isVerifySpinActive, setVerifySpinActive] = useState<boolean>(false);
  const [isRecoverSpinActive, setRecoverSpinActive] = useState<boolean>(false);

  let intervalEnroll: NodeJS.Timeout | undefined;
  let intervalVerify: NodeJS.Timeout | undefined;
  let intervalRecover: NodeJS.Timeout | undefined;
  const intervalTime = 3000;

  let MainWidth = resolution.width;
  const widthCam = typeof window !== 'undefined' ? window.innerWidth : 0;

  let View = { position: 'absolute' } as React.CSSProperties;

  if (widthCam < 716) {
    MainWidth = width - 76;
  }

  if (widthCam < 400) {
    View = {
      ...View,
      width: 'calc(100% - 41px)',
      height: 'unset'
    };
  }

  // const bodymovinOptions = {
  //     loop: true,
  //     autoplay: true,
  //     prerender: true,
  //     // animationData: animation
  // };

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://ftbrowser.anonid.io' + '/model/';

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      console.log('Model was not loaded.');
    }
  };

  const handleWebcamStream = async () => {
    console.log('handlewebcamStream.................');

    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && canvasRef.current) {
      setWebCamRef(webcamRef.current);
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      setTimeout(() => {
        startFaceDetection(video, videoWidth, videoHeight);
      }, 1500);
    }
  };

  const startFaceDetection = (video: HTMLVideoElement, videoWidth: number, videoHeight: number) => {
    console.log('detection');

    if (canvasRef.current) {
      const canvas = canvasRef.current; // Direct reference to the canvas element
      const context = canvas.getContext('2d');

      intervalId.current = requestAnimationFrame(
        _debounce(async function detect () {
          try {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

            if (detection) {
              setIsDetected(true);

              if (canvas.width > 0 && canvas.height > 0 && context) {
                const resizedDetections = faceapi.resizeResults(detection, {
                  width: videoWidth,
                  height: videoHeight
                });

                context.clearRect(0, 0, videoWidth, videoHeight);
                faceapi.draw.drawDetections(canvas, resizedDetections); // Pass 'canvas' instead of 'context'
              }
            }
          } catch (e) {
            console.error('Error during face detection: ', e);
          }

          intervalId.current = requestAnimationFrame(detect);
        }, 1000) // Debounce time in milliseconds
      );
    } else {
      console.log('canvas ref is null');
    }
  };

  const stopFaceDetection = () => {
    if (intervalId.current) {
      cancelAnimationFrame(intervalId.current);
    }
  };

  const enrollUser = () => {
    setSelectButton('enroll');
    setEnrollSpinActive(true);
    setVerifySpinActive(false);
    setRecoverSpinActive(false);

    if (!WebcamStarted) {
      setWebcamStarted(true);
    }

    intervalEnroll = setInterval(() => {
      enrollRequest();
    }, intervalTime);
  };

  const enrollRequest = () => {
    console.log('call create wallet func');
    console.log('https://ftbrowser.anonid.io' + '/model/');
    // const imgSrc = WebCamRef?.getScreenshot();
    const imgSrc = webcamRef.current?.getScreenshot();

    console.log('imgSrc: ' + imgSrc);
    Axios.post('https://ftbrowser.anonid.io' + '/create_wallet', {
      image: imgSrc
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          show('Face Vector Read Successfully. Thanks for using Anon ID, no further action needed, verify at conference for access');
          clearInterval(intervalEnroll);

          setEnrollSpinActive(false);
        } else if (resStateText == 'Error') {
          show(res.data.msg);

          if (res.data.msg.includes("Key 'image' not found in the JSON content")) {
            clearInterval(intervalEnroll);
            setEnrollSpinActive(false);
          }
        } else if (resStateText == 'Already Exist') {
          show('Face Vector Already Registered. Please Verify');
          clearInterval(intervalEnroll);
          setEnrollSpinActive(false);
        } else if (resStateText == 'Move Closer') {
          show('Please Move Closer!');
        } else if (resStateText == 'Go Back') {
          show('Please Move Back!');
        } else if (resStateText == 'Liveness check failed') {
          show('Liveness check failed!');
        } else if (resStateText == 'Face is too large') {
          show('Face is too large.');
        } else if (resStateText == 'Spoof') {
          show('Spoof Face');
        } else {
          console.log('Error');
        }
      }
    }).catch((err) => {
      console.log('err', err);
      show('Server Error. Please contact dev team');
    });
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const stream = webcamRef.current.video.srcObject as MediaStream;

      if (stream) {
        const tracks = stream.getTracks();

        tracks.forEach((track) => track.stop());
        webcamRef.current.video.srcObject = null;

        const context = canvasRef.current.getContext('2d');

        setIsDetected(false);
        setWebcamStarted(false);

        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  const verifyUser = async () => {
    setSelectButton('verify');
    setVerifySpinActive(true);
    setEnrollSpinActive(false);
    setRecoverSpinActive(false);

    if (!WebcamStarted) {
      setWebcamStarted(true);
    }

    intervalVerify = setInterval(() => {
      verifyRequest();
    }, intervalTime);
  };

  const verifyRequest = () => {
    // const imgSrc = WebCamRef?.getScreenshot();
    const imgSrc = webcamRef.current?.getScreenshot();

    Axios.post('https://ftbrowser.anonid.io' + '/get_wallet', {
      image: imgSrc
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          show('Face Vector verified Successfully');
          clearInterval(intervalVerify);
          setCessAddr(res.data.address, res.data.mnemonic);
          setVerifySpinActive(false);
          _handleModalClose();
        } else if (resStateText == 'No Users') {
          show('Face Vector not Registered. Please enroll');
          // setCameraCaptureStart(true);
        } else if (resStateText == 'Move Closer') {
          show('Please Move Closer!');
        } else if (resStateText == 'Go Back') {
          show('Please Move Back!');
        } else if (resStateText == 'Error') {
          show(res.data.msg);

          if (res.data.msg.includes("Key 'image' not found in the JSON content")) {
            clearInterval(intervalVerify);
            setVerifySpinActive(false);

            return;
          }

          if (res.data.msg == 'DB sync error') {
            clearInterval(intervalVerify);
            setVerifySpinActive(false);
          }
        } else {
          show('Error');
        }
      }
    }).catch((err) => {
      console.log('err', err);
      show('Server Error. Please contact dev team.');
    });
  };

  const recoverUser = () => {
    if (recoveryKey.length == 0) {
      show('Please Input Recovery Key!');

      return;
    }

    setSelectButton('recover');
    setRecoverSpinActive(true);
    setEnrollSpinActive(false);
    setVerifySpinActive(false);

    if (!WebcamStarted) {
      setWebcamStarted(true);
    }

    intervalRecover = setInterval(() => {
      recoverRequest();
    }, intervalTime);
  };

  const recoverRequest = () => {
    console.log('call create wallet func');
    console.log('https://ftbrowser.anonid.io' + '/recover_wallet');
    // const imgSrc = WebCamRef?.getScreenshot();
    const imgSrc = webcamRef.current?.getScreenshot();

    Axios.post('https://ftbrowser.anonid.io' + '/recover_wallet', {
      image: imgSrc,
      recovery_key: recoveryKey
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          show('User recovered successfully');
          clearInterval(intervalRecover);

          setRecoverSpinActive(false);
        } else if (resStateText == 'Unregistered User') {
          show(res.data.msg);
          clearInterval(intervalRecover);
          setRecoverSpinActive(false);
        } else if (resStateText == 'Error') {
          show(res.data.msg);

          if (res.data.msg.includes("Key 'image' not found in the JSON content")) {
            clearInterval(intervalRecover);
            setRecoverSpinActive(false);
          }
        } else if (resStateText == 'Move Closer') {
          show('Please Move Closer!');
        } else if (resStateText == 'Go Back') {
          show('Please Move Back!');
        } else if (resStateText == 'Liveness check failed') {
          show('Liveness check failed!');
        } else if (resStateText == 'Face is too large') {
          show('Face is too large');
        } else if (resStateText == 'Spoof') {
          show('Spoof');
        } else {
          console.log('Error');
        }
      } else {
        show('Backend Error: Not responding correctly');
      }
    }).catch((err) => {
      console.log('err', err);
      show('Server Error. Please contact dev team');
    });
  };

  const _handleModalClose = () => {
    stopCamera();
    setEnrollSpinActive(false);
    setVerifySpinActive(false);

    if (intervalVerify != null) {
      clearInterval(intervalVerify);
    }

    if (intervalEnroll != null) {
      clearInterval(intervalEnroll);
    }
  };

  useEffect(() => {
    setWebcamStarted(true);
    loadModels();

    return () => {
      clearInterval(intervalEnroll);
      clearInterval(intervalVerify);
      clearInterval(intervalRecover);
    };
  }, []);

  useEffect(() => {
    console.log('webcamstarted', WebcamStarted);

    if (!WebcamStarted) {
      stopFaceDetection();
      setIsDetected(false);
    }
  }, [WebcamStarted]);

  return WebcamStarted ? (
    <div className='content'>
      <div
        className='sub1'
        style={{ height: `calc(${height}px + 10px)`, width: `calc(${width}px + 10px)` }}
      >
        {/* {!WebCamRef? && (
					<SpinWrapper>
						<Spin size="large" />
					</SpinWrapper>
				)} */}
        <div style={{ margin: 'auto', height: '100%' }}>
          <AnimationWrapper>
            {/* {WebcamStarted ? ( */}
            <Webcam
              audio={false}
              height={240}
              onLoadedMetadata={() => {
                handleWebcamStream();
              }}
              ref={webcamRef}
              style={View}
              videoConstraints={{ width: MainWidth, height: 240 }}
              width={MainWidth}
            />
            {/* ):(<></>)} */}
            <Col
              sm={9}
              style={{ opacity: 0.3 }}
              xs={12}
            >
              {/* <ReactBodymovin options={bodymovinOptions}/> */}
            </Col>
            <canvas
              ref={canvasRef}
              style={View}
            />
          </AnimationWrapper>
        </div>
      </div>
      <div>
        <div className='sub2'>
          <div
            className='subContent1'
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <button
              className={`${selectButton == 'enroll' ? 'active' : ''} buttonClass`}
              onClick={enrollUser}
            >ENROLL
              <Spin
                size='small'
                spinning={isEnrollSpinActive}
                style={{ marginLeft: '10px' }}
              ></Spin>
            </button>
            <button
              className={`${selectButton == 'verify' ? 'active' : ''} buttonClass`}
              onClick={verifyUser}
            >VERIFY
              <Spin
                size='small'
                spinning={isVerifySpinActive}
                style={{ marginLeft: '10px' }}
              ></Spin>
            </button>
            <button
              className={`${selectButton == 'recover' ? 'active' : ''} buttonClass`}
              onClick={recoverUser}
            >RECOVER
              <Spin
                size='small'
                spinning={isRecoverSpinActive}
                style={{ marginLeft: '10px' }}
              ></Spin>
            </button>
          </div>
          <div>
            <input
              className='subContent2'
              onChange={(e) => setRecoveryKey(e.target.value)}
              placeholder='Enter your recover key'
              value={recoveryKey}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (<div
    className='cursor-pointer'
    onClick={() => {
      setWebcamStarted(true);
    }}
  >Turn on your camera {WebcamStarted}</div>);
};

export default CameraComp;
