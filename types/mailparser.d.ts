// types/mailparser.d.ts
declare module 'mailparser' {
  export function simpleParser(
    stream: any,
    callback: (err: any, parsed: any) => void
  ): void;
}
