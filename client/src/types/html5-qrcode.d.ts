declare module "html5-qrcode" {
  export interface QrCodeResult {
    result: {
      text: string;
      format?: string;
    };
  }
  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: {
        fps: number;
        verbose: boolean;
      }
    );
    render(
      onScanSuccess: (decodedText: string, decodedResult: QrCodeResult) => void,
      onScanError: (errorMessage: string) => void
    ): void;
    clear(): void;
  }

  export class Html5Qrcode {
    static SCAN_TYPE_CAMERA: number;
    static SCAN_TYPE_FILE: number;
    static getCameras(): Promise<Array<{ id: string; label: string }>>;
    stop(): Promise<void>;
  }
}
