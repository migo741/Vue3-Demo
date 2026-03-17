declare module "@mediapipe/hands" {
  export interface Landmark {
    x: number;
    y: number;
    z: number;
  }

  export interface Results {
    multiHandLandmarks?: Landmark[][];
    multiHandedness?: any[];
    image: HTMLCanvasElement | HTMLImageElement;
  }

  export interface HandsOptions {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class Hands {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: HandsOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLImageElement }): Promise<void>;
    close(): void;
  }
}

declare module "@mediapipe/camera_utils" {
  export interface CameraOptions {
    onFrame: () => Promise<void>;
    width: number;
    height: number;
  }

  export class Camera {
    constructor(video: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}
