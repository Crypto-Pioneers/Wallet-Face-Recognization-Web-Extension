
import React from "react";

import { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import Webcam from "react-webcam";

interface StateType {
	isDetected: boolean;
	WebcamStarted: boolean;
	WebCamRef: Webcam | null;
	CameraActiveType: number;
	resolution: {
		width: number;
		height: number;
	};
}

const initialState: StateType = {
	isDetected: false,
	WebcamStarted: true,
	WebCamRef: null,
	CameraActiveType: 1,
	resolution: {
		width: 360,
		height: 240
	}
};

interface WebCamContextType extends StateType {
	setIsDetected: (value: boolean) => void;
	setWebcamStarted: (value: boolean) => void;
	setWebCamRef: (ref: Webcam | null) => void;
	setCameraActiveType: (type: number) => void;
	setResolution: (resolution: { width: number; height: number }) => void;
}

const defaultValues: WebCamContextType = {
	...initialState,
	setIsDetected: () => {},
	setWebcamStarted: () => {},
	setWebCamRef: () => {},
	setCameraActiveType: () => {},
	setResolution: () => {}
};

export const WebCamContext = createContext<WebCamContextType>(defaultValues);

type Action =
	| { type: "SET_DETECTED"; payload: boolean }
	| { type: "SET_WEBCAM"; payload: boolean }
	| { type: "SET_WEBCAM_REF"; payload: Webcam | null }
	| { type: "SET_RESOLUTION"; payload: { width: number; height: number } }
	| { type: "SET_CAMERA_ACTIVE_TYPE"; payload: number };

const WebcamReducer = (state: StateType, action: Action): StateType => {
	switch (action.type) {
		case "SET_DETECTED":
			return { ...state, isDetected: action.payload };
		case "SET_WEBCAM":
			console.log("SET_WEBCAM");
			return { ...state, WebcamStarted: action.payload };
		case "SET_WEBCAM_REF":
			return { ...state, WebCamRef: action.payload };
		case "SET_RESOLUTION":
			return { ...state, resolution: action.payload };
		case "SET_CAMERA_ACTIVE_TYPE":
			return { ...state, CameraActiveType: action.payload };
		default:
			return state;
	}
};

interface WebcamProviderProps {
	children: ReactNode;
}

export const WebcamProvider: React.FC<WebcamProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(WebcamReducer, initialState);
	const setIsDetected = (value: boolean) => dispatch({ type: "SET_DETECTED", payload: value });
	const setWebcamStarted = (value: boolean) => dispatch({ type: "SET_WEBCAM", payload: value });
	const setWebCamRef = (ref: Webcam | null) => dispatch({ type: "SET_WEBCAM_REF", payload: ref });
	const setCameraActiveType = (type: number) => dispatch({ type: "SET_CAMERA_ACTIVE_TYPE", payload: type });
	const setResolution = (value: { width: number, height: number }) => dispatch({ type: "SET_RESOLUTION", payload: value });

	const value = { ...state, setIsDetected, setWebcamStarted, setWebCamRef, setCameraActiveType, setResolution };
	return <WebCamContext.Provider value={value}>{children}</WebCamContext.Provider>;
};

