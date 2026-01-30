interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
}

interface Window {
  ethereum?: Ethereum;
}
