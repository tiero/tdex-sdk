import { Psbt, Transaction } from 'liquidjs-lib';
import * as messages from './api-spec/protobuf/gen/js/tdex/v1/trade_pb';

/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */
export function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function decodePsbt(
  psetBase64: string
): { psbt: Psbt; transaction: Transaction } {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    console.log(ignore);
    throw new Error('Invalid psbt');
  }

  const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  const transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt,
    transaction,
  };
}

export function getClearTextTorProxyUrl(
  torProxyEndpoint: string,
  url: URL
): string {
  // get just_onion_host_without_dot_onion
  const splitted = url.hostname.split('.');
  splitted.pop();
  const onionPubKey = splitted.join('.');

  return `${torProxyEndpoint}/${onionPubKey}`;
}

/**
 * used to inspect ProposeTrade/CompleteTrade
 * reply messages
 * @param tradeReply ProposeTrade/CompleteTrade protobuf messages
 * @param reject the promise's reject function
 */
export function rejectIfSwapFail(
  tradeReply: messages.ProposeTradeResponse | messages.CompleteTradeResponse,
  reject: (reason?: any) => void
): boolean {
  const swapFail = tradeReply.swapFail;
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.id}. Failure code ${swapFail.failureCode} | reason: ${swapFail.failureMessage}`;
    reject(errorMessage);
    return true;
  }

  return false;
}
