export interface BaseToken {
  name: string;
  symbol: string;
  logo: string;
  price: number;
}

export interface Token extends BaseToken {
  address: string;
  decimals: number;
}

export interface TokenWithBalance extends Token {
  balance: number;
}
