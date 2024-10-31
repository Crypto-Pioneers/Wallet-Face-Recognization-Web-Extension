// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountInfo } from '../../Popup/ImportSeed/index.js';

import QrSvg from '@wojtekmaj/react-qr-svg';
import { Spin, Tooltip } from 'antd';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundle } from '@polkadot/apps-config';
import { createAccountSuri, validateSeed } from '@polkadot/extension-ui/messaging';
import { Keyring } from '@polkadot/keyring';
import { objectSpread } from '@polkadot/util';

import backPng from '../../assets/img/back.svg';
import copySvg from '../../assets/img/copy.svg';
import copyBlackPng from '../../assets/img/copy-black.svg';
import dashboardSvg from '../../assets/img/dashboard-bg.svg';
import exitSvg from '../../assets/img/exit.png';
import nominatePng from '../../assets/img/nominate.png';
import receivePng from '../../assets/img/receive.png';
import sendPng from '../../assets/img/send.png';
import stakingPng from '../../assets/img/staking.png';
import txPng from '../../assets/img/tx.png';
import { ActionContext } from '../../components/index.js';
import { useToast, useTranslation } from '../../hooks/index.js';
import { styled } from '../../styled.js';
import { DEFAULT_TYPE } from '../../util/defaultType.js';
import * as formatter from '../../util/formatter';
import request from '../../util/request';
import store from '../../util/store';
// import animation from '@src/utils/data/bodymovin-animation.json';
import webconfig from '../../webconfig';
import CameraComp from '../camera';
import Header from '../header';

// import type { SubmittableExtrinsic } from "@polkadot/api/types";

interface Props {
  className?: string;
}

interface SDKConfig {
  nodeURL: string | string[];
  keyringOption: {
    type: 'ed25519' | 'sr25519' | 'ecdsa';
    ss58Format: number;
  };
  gatewayURL?: string;
  gatewayAddr?: string;
}

interface Account {
  address: string;
  mnemonic: string;
}

interface FormatParam {
  amount: string,
  address: string
}

interface TransactionHistory {
  key: string;
  amount: string;
  type: string;
  from: string;
  fromShort: string;
  to: string;
  toShort: string;
  time: string;
}

interface Response {
  hash: string,
  amount: string,
  from: string,
  to: string,
  timestamp: number
}

interface ResponseData {
  content: Response[],
  count: number
}
// let unsubBalance;
// let sdk = null;
interface InputValue {
  staking: {
    amount: string;
    address: string;
  };
  send: {
    amount: string;
    address: string;
  };
  nominate: {
    amount: string;
    address: string;
  };
}

let pageIndex = 1;
let historyCount = 0;
let historyTotalPage = 0;

function Home ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { show } = useToast();
  const onAction = useContext(ActionContext);
  const [loading, setLoading] = useState<string | null>(null);
  const [current, setCurrent] = useState<string>('login');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [account, setAccount] = useState<Account>({ address: '', mnemonic: '' });
  const [balance, setBalance] = useState<number>(0);
  const [boxTitle, setBoxTitle] = useState<string>('');
  const [available, setAvailable] = useState<number>(0);
  const [staking, setStaking] = useState<number>(0);
  const [nominate, setNominate] = useState<number>(0);
  const [historys, setHistorys] = useState<TransactionHistory[]>([]);
  const [customRPC, setCustomRPC] = useState<string>('');
  const [inputValue, setInputValue] = useState<InputValue>({
    staking: { amount: '0', address: '' },
    send: { amount: '0', address: '' },
    nominate: { amount: '0', address: '' }
  });

  let historyTimeout: NodeJS.Timeout | undefined;

  const InitAPI = async (config: SDKConfig) => {
    try {
      // Use the first URL if `nodeURL` is an array
      const url = Array.isArray(config.nodeURL) ? config.nodeURL[0] : config.nodeURL;

      // Create a WebSocket provider
      const provider = new WsProvider(url);

      // Create the API instance
      const api = await ApiPromise.create({
        provider,
        typesBundle // Use custom types if necessary, you may omit this if not needed
      });

      // Create a keyring instance
      const keyring = new Keyring({
        type: config.keyringOption.type,
        ss58Format: config.keyringOption.ss58Format
      });

      console.log('API TEST');
      console.log(api.tx);
      // Log to confirm setup is complete
      console.log(`API connected to ${url}, keyring set for type ${config.keyringOption.type}`);

      return { api, keyring };
    } catch (error) {
      console.error(`Failed to initialize API or keyring: ${error}`);
      throw error; // Rethrow the error after logging it
    }
  };

  useEffect(() => {
    const url = store.get<string>('custom-node');

    setCurrent('login');
    setLoading(null);

    if (url) {
      setCustomRPC(url);
    }

    init(url);
    autoLogin();
    historyTimeout = setInterval(function () {
      const addr = store.get<string>('addr');

      if (addr && account && account.address) {
        loadHistoryList(addr);
      }
    }, 5000);

    return () => {
      clearInterval(historyTimeout);
      // if (unsubBalance) {
      // 	unsubBalance();
      // }
    };
  }, []);

  const init = async (url: string | null) => {
    try {
      console.log('init step 1/3');
      const config = JSON.parse(JSON.stringify(webconfig.sdkConfig));

      if (url && url != 'wss://testnet-rpc1.cess.cloud/ws/') {
        config.nodeURL = url;
      }

      console.log('init step 2/3');
      const { api, keyring } = await InitAPI(config);

      if (api) {
        // window.api = api;
        // window.keyring = keyring;

        // console.log(window.api)
        // console.log(window.keyring)
        if (customRPC && url && url != 'wss://testnet-rpc1.cess.cloud/ws/') {
          store.set<string>('custom-node', url);
        }
      }

      console.log(config.nodeURL);
      console.log('init step 3/3');

      // createWalletTestFromFace('cXjc4Lb8bhC9c7R9o4zowPtw5GTwyzxbGk32uRzrbDnyJYg5E', 'february duck borrow there dynamic original screen clip harsh drive bird tunnel');
      return { api, keyring };
    } catch (e) {
      show('has error');
      console.log(e);

      return null;
    }
  };

  const autoLogin = async () => {
    const addr = store.get<string>('addr');
    const mnemonic = store.get<string>('mnemonic');

    if (!addr || !mnemonic) {
      return;
    }

    setCurrent('dashboard');
    setAccount({ address: addr, mnemonic });
    loadHistoryList(addr);
  };

  const createWalletTestFromFace = (addr: string, mnemonic: string) => {
    const suri = `${mnemonic || ''}`;
    const genesis = '';
    const type = DEFAULT_TYPE;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        const account = objectSpread<AccountInfo>({}, validatedAccount, { genesis, type });
        const name = 'Dev';
        const password = ' ';

        localStorage.setItem('cess_address', addr);
        createAccountSuri(name, password, account.suri, type, account.genesis)
          .then(() => onAction('/'))
          .catch((error): void => {
            console.error(error);
          });
      })
      .catch(() => {
        show(
          t('Invalid mnemonic seed')
        );
      });

    const addrFromFace = addr;
    const acc = {
      address: addrFromFace,
      mnemonic
    };

    setAccount(acc);
    setAccounts([acc]);
    setAccount(acc);
    accounts;
    // setCurrent("dashboard");

    // subBalance(addrFromFace);
    setAvailable(0);
    setStaking(0);
    setNominate(0);
    setBalance(0);
    // end
    pageIndex = 1;
    loadHistoryList(acc.address);
    store.set<string>('addr', addrFromFace);
  };

  // const subBalance = async (address: string) => {
  // if (unsubBalance) {
  // 	unsubBalance();
  // }
  // unsubBalance = await window.api?.query["system"]["account"](address, ({ nonce, data }: { nonce: number, data: AccountInfo['data'] }) => {
  // 	console.log('Nonce:' + nonce);
  // 	console.log('Free balance:' + data.free.toString()); // Assuming `data.free` is of Balance type
  // 	console.log('Reserved balance:' + data.reserved.toString());

  // 	// If you have specific handlers or state updates in React
  // 	const availableB = formatter.fixedBigInt(data.free.toBigInt() / (1n * 10n ** 18n));
  // 	setAvailable(availableB);
  // 	const stakingB = formatter.fixedBigInt(data.reserved.toBigInt() / (1n * 10n ** 18n));
  // 	setStaking(stakingB);
  // 	const nominateB = 0; //formatter.fixedBigInt(data.feeFrozen.toBigInt() / (1n * 10n ** 18n));
  // 	setNominate(nominateB);
  // 	const all = availableB + stakingB + nominateB;
  // 	console.log("Balance:" + all);
  // 	setBalance(all);
  // 	loadHistoryList(address);
  // });
  // return unsubBalance;
  // };

  const onClick = (e: string) => {
    setCurrent(e);
    setBoxTitle(e);
  };

  const onCopy = (txt: string): void => {
    copy(txt);
    show('Copied');
  };

  const onLogout = () => {
    // if (unsubBalance) {
    // 	unsubBalance();
    // }
    show('Logout success.');
    setAccount({ address: '', mnemonic: '' });
    setCurrent('login');
    store.remove('addr');
  };

  // const subState = (d: any) => {
  // 	show(d);
  // 	if (typeof d == "string") {
  // 		show(d);
  // 	}
  // 	else {
  // 		show(d.status.toString());
  // 	}
  // };

  const onSend = () => {
    try {
      const ret = formatParams(inputValue.send);

      if (!ret) {

      }
      // const { address, amount } = ret;
      // const extrinsic = window.api?.tx["balances"]["transfer"](address, amount);
      // if (!extrinsic) {
      // 	console.error('Failed to create extrinsic');
      // 	return;
      // }
      // submitTx(extrinsic);
    } catch (e) {
      let msg = (e as Error).message;

      if (msg.includes('MultiAddress')) {
        msg = 'Please input the correct amount and receiving address.';
      }

      console.log(msg);
      show(msg);
    }
  };

  const onStaking = () => {
    try {
      const ret = formatParams(inputValue.staking);

      if (!ret) {

      }
      // const { address, amount } = ret;
      // const extrinsic = window.api?.tx["sminer"]["increaseCollateral"](address, amount);
      // if (!extrinsic) {
      // 	console.error('Failed to create extrinsic');
      // 	return;
      // }
      // submitTx(extrinsic);
    } catch (e) {
      show((e as Error).message);
    }
  };

  const onNominate = async () => {
    try {
      const ret = formatParams(inputValue.nominate);

      if (!ret) {

      }
      // const { address, amount } = ret;
      // let extrinsic = window.api?.tx["staking"]["nominate"]([address]);
      // if (!extrinsic) {
      // 	console.error('Failed to create extrinsic');
      // 	return;
      // }
      // const ret2 = await submitTx(extrinsic, true);
      // if (ret2 && ret2.msg == "ok") {
      // 	extrinsic = window.api?.tx["staking"]["bond"](amount, "Staked");
      // 	if (!extrinsic) {
      // 		console.error('Failed to create extrinsic');
      // 		return;
      // 	}
      // 	submitTx(extrinsic);
      // }
    } catch (e) {
      show((e as Error).message);
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>, k1: keyof InputValue, k2: keyof InputValue['staking']) => {
    setInputValue((prevState) => ({
      ...prevState,
      [k1]: {
        ...prevState[k1],
        [k2]: e.target.value
      }
    }));
  };

  const loadHistoryList = async (addr: string) => {
    const address = addr || account.address;

    if (!address) {
      show('address is null ,jump to load history.');

      return;
    }

    const url = `/transfer/query?Acc=${address}&pageindex=${pageIndex}&pagesize=${webconfig.historyPageSize}`;
    const ret = await request(url);

    if (ret.msg !== 'ok') {
      return;
      // return show(ret.msg || "Request Error");
    }

    if (typeof ret.data !== 'object') {
      return;
    }

    const data = ret.data as ResponseData;

    if (!data.content) {
      return show('API error');
    }

    const list = data.content.map((t: Response) => {
      return {
        key: t.hash,
        amount: formatter.formatBalance(t.amount),
        type: t.from == address ? 'Send' : 'Receive',
        from: t.from,
        fromShort: formatter.formatAddress(t.from),
        to: t.to,
        toShort: formatter.formatAddress(t.to),
        time: moment(t.timestamp).format('YYYY/MM/DD HH:mm:ss')
      };
    });

    historyCount = data.count;
    historyTotalPage = historyCount / webconfig.historyPageSize;

    if (historyCount % webconfig.historyPageSize != 0) {
      historyTotalPage++;
    }

    setHistorys(list);
  };

  const onNextHistoryPage = (l: number) => {
    pageIndex = pageIndex + l;
    const addr = store.get<string>('addr');

    if (addr) {
      loadHistoryList(addr);
    }
  };

  const formatParams = (obj: FormatParam): {address: string, amount: bigint} | null => {
    if (!obj.amount) {
      show('Amount is required.');

      return null;
    }

    if (obj.amount.length > 29) {
      show('The amount character length exceeds the limit.');

      return null;
    }

    if (isNaN(parseFloat(obj.amount))) {
      show('The Amount allow only numbers input.');

      return null;
    }

    const amount = parseFloat(obj.amount);

    if (amount < 0) {
      show('Amount error.');

      return null;
    }

    if (amount > available) {
      show('amount: ' + amount + ' available: ' + available);
      show('Insufficient Balance');

      return null;
    }

    const ret_amount = BigInt(amount * 1e18);

    if (!obj.address) {
      show('Account address is required.');

      return null;
    }

    if (obj.address.length < 40 || obj.address.length > 49) {
      show('Please input the correct receiving address.');

      return null;
    }

    return { address: obj.address, amount: ret_amount };
  };

  const backToDashboard = () => {
    setInputValue({
      staking: { amount: '0', address: '' },
      send: { amount: '0', address: '' },
      nominate: { amount: '0', address: '' }
    });
    document.querySelectorAll<HTMLTextAreaElement>('.textarea1').forEach((t) => {
      t.value = '';
    });
    document.querySelectorAll<HTMLTextAreaElement>('.textarea2').forEach((t) => {
      t.value = '';
    });
    setCurrent('dashboard');
    const addr = store.get<string>('addr');

    if (addr) {
      loadHistoryList(addr);
    }
  };

  // const submitTx = async (extrinsic: SubmittableExtrinsic<'promise'>, hideSuccessTips: boolean = false) => {
  // 	let ret;
  // 	try {
  // 		setLoading("signature");
  // 		sdk = new Common(window.api, window.keyring);
  // 		const wallet = window.keyring?.addFromMnemonic(account.mnemonic);
  // 		if (!wallet) {
  // 			console.error('Failed to create wallet');
  // 			return;
  // 		}
  // 		const hash = await extrinsic.signAndSend(wallet);
  // 		// ret = await sdk.signAndSend(account.address, extrinsic, subState);
  // 		ret = { msg: "ok", data: hash };
  // 		if (ret.msg == "ok") {
  // 			if (!hideSuccessTips) {
  // 				if (current == "Nominate") {
  // 					antdHelper.alertOk("The Nomination is submitted", `txhash: ${ret.data}`);
  // 				} else {
  // 					antdHelper.alertOk("The transaction is submitted.", `txhash: ${ret.data}`);
  // 				}
  // 				backToDashboard();
  // 			}
  // 		} else {
  // 			show(ret.msg + ret.data);
  // 		}
  // 	} catch (e) {
  // 		let msg = (e as Error).message || e as Error;
  // 		if (typeof msg == "object") {
  // 			msg = JSON.stringify(msg);
  // 		}
  // 		if (msg.includes("balance too low")) {
  // 			show("Insufficient Balance");
  // 		} else {
  // 			show(msg);
  // 		}
  // 	} finally {
  // 		setLoading(null);
  // 	}
  // 	return ret;
  // };

  // const onSelectAccountForInput = async () => {
  // 	let acc = await antdHelper.showSelectAccountBox(accounts);
  // 	inputValue = {
  // 		staking: { amount: 0, address: acc.address },
  // 		send: { amount: 0, address: acc.address },
  // 		nominate: { amount: 0, address: acc.address }
  // 	};
  // 	let t1 = document.querySelectorAll(".textarea2");
  // 	t1.forEach(t => (t.value = acc.address));
  // };

  // const onReConnect = async (e: any) => {
  // 	let timeout = setTimeout(function () {
  // 		show("Connect timeout");
  // 	}, 5000);
  // 	let { api } = await init(customRPC);
  // 	clearTimeout(timeout);
  // 	if (api) {
  // 		show("Connected");
  // 	} else {
  // 		show("Connect failed");
  // 	}
  // };

  return (
    <div className={className}>
      {
        current === 'login' &&
          <div className='headerPart'>
            <div>
              <span className='part1'>
                <h1 className='content1'>ANON ID</h1>
              </span>
              <Header />
            </div>
            <div className='part3'>
              <CameraComp setCessAddr={createWalletTestFromFace} />
            </div>
            <p className='part4'>Anon ID does not store any faces only vector arrays</p>
          </div>
      }
      <div className={current === 'dashboard' ? 'dashboard' : 'none'}>
        <div className='b1'>
          <div
            className='btn'
            onClick={onLogout}
          ></div>
          <div className='line l1'>{formatter.toLocaleString(balance)} CESS</div>
          <div className='line l2'>Balance</div>
          <div className='line l3'>
            <span className='txt'>{formatter.formatAddressLong(account.address)} </span>
            <label
              className='icon'
              onClick={() => onCopy(account.address)}
            ></label>
          </div>
          {/* <div className={accountType == "face" ? "line l4" : "none"}>
						<label className="icon"></label>
						<span className="txt">Show the CESS address</span>
					</div> */}
        </div>
        <div className='b2'>
          <div
            className='btn-box btn1'
            onClick={() => onClick('Send')}
          >
						Send
          </div>
          <div
            className='btn-box btn2'
            onClick={() => onClick('Receive')}
          >
						Receive
          </div>
          <div
            className='btn-box btn3'
            onClick={() => onClick('Staking')}
          >
						Staking
          </div>
          <div
            className='btn-box btn4'
            onClick={() => onClick('Nominate')}
          >
						Nominate
          </div>
        </div>
        <div className='b3'>
          <div className='b3-t'>Asset Analysis</div>
          <div className='tb'>
            <div className='tr'>
              <span>Available</span>
              <label>{formatter.toLocaleString(available)} CESS</label>
            </div>
            <div className='tr'>
              <span>Staking</span>
              <label>{formatter.toLocaleString(staking)} CESS</label>
            </div>
            <div className='tr'>
              <span>Nominate</span>
              <label>{formatter.toLocaleString(nominate)} CESS</label>
            </div>
          </div>
        </div>
        <div className='b4'>
          <div className='t1'>History</div>
          <div className='tb'>
            {historys &&
							historys.map((t: TransactionHistory) => {
							  return (
							    <div
							      className='tr'
							      key={t.key}
							    >
							      <div className='left'>
							        <span className='amount'>
							          <Tooltip title={t.type == 'Send' ? '-' + t.amount : '+' + t.amount}>
							            <span className='o-text'>
							              {t.type == 'Send' ? '-' : '+'}
							              {t.amount}
							            </span>
							          </Tooltip>
							        </span>
							        <label className='type'>{t.type}</label>
							      </div>
							      <div className='right'>
							        <span
							          onClick={() => onCopy(t.from)}
							          title='copy'
							        >
												From {t.fromShort}
							        </span>
							        <label
							          onClick={() => onCopy(t.to)}
							          title='copy'
							        >
												To {t.toShort}
							        </label>
							        {/* <font>{t.time}</font> */}
							      </div>
							    </div>
							  );
							})}
            {!historys || historys.length == 0 ? <div className='no-data'>No data</div> : ''}
          </div>
          <div className={historys && historys.length && historyTotalPage > 1 ? 'pager' : 'none'}>
            <div
              className={pageIndex == 1 ? 'none' : 'pre'}
              onClick={() => onNextHistoryPage(-1)}
            ></div>
            <div
              className={pageIndex >= historyTotalPage ? 'none' : 'next'}
              onClick={() => onNextHistoryPage(1)}
            ></div>
          </div>
        </div>
      </div>
      <div className={'Send,Receive,Staking,Nominate'.includes(current) ? 'box-out' : 'none'}>
        <div className='box'>
          <div className='top-header'>
            <div
              className='back'
              onClick={backToDashboard}
            ></div>
            {boxTitle}
          </div>
          <div className={current == 'Send' ? 'send' : 'none'}>
            <div className='myinput'>
              <div className='tips'>
                <span>Receiving Address</span>
                {/* <label className={accountType == "polkdot" && accounts && accounts.length > 1 ? "none" : "none"} onClick={onSelectAccountForInput}>
									+
								</label> */}
              </div>
              <textarea
                className='textarea2'
                maxLength={49}
                onChange={(e) => onInput(e, 'send', 'address')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'send', 'address')}
                placeholder='cX'
              ></textarea>
            </div>
            <div className='myinput'>
              <div className='tips'>Amount(CESS)</div>
              <textarea
                className='textarea1'
                maxLength={29}
                onChange={(e) => onInput(e, 'send', 'amount')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'send', 'amount')}
                placeholder='0'
              ></textarea>
            </div>
            <div className='t1'>Balance: {formatter.toLocaleString(available)} CESS</div>
            {loading == 'signature'
              ? (
                <div className='btn btn-disabled'>
                  <Spin size='small' />
								&nbsp;&nbsp;Loading...
                </div>
              )
              : (
                <div
                  className='btn'
                  onClick={onSend}
                >
								Signature
                </div>
              )}
          </div>
          <div className={current == 'Receive' ? 'receive' : 'none'}>
            <div className='qr'>{account?.address && <QrSvg value={account?.address} />}</div>
            <div className='show-address'>
              <div className='tips'>Receiving Address</div>
              <div className='address'>{account?.address}</div>
              <div
                className='btn-copy'
                onClick={() => onCopy(account?.address)}
              ></div>
            </div>
          </div>
          <div className={current == 'Staking' ? 'staking' : 'none'}>
            <div className='myinput'>
              <div className='tips'>
                <span>Storage Miner Account</span>
                {/* <label className={accountType == "polkdot" && accounts && accounts.length > 1 ? "none" : "none"} onClick={onSelectAccountForInput}>
									+
								</label> */}
              </div>
              <textarea
                className='textarea2'
                maxLength={49}
                onChange={(e) => onInput(e, 'staking', 'address')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'staking', 'address')}
                placeholder='cX'
              ></textarea>
            </div>
            <div className='myinput'>
              <div className='tips'>Staking Amount(CESS)</div>
              <textarea
                className='textarea1'
                maxLength={29}
                onChange={(e) => onInput(e, 'staking', 'amount')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'staking', 'amount')}
                placeholder='0'
              ></textarea>
            </div>
            <div className='t1'>Balance: {formatter.toLocaleString(available)} CESS</div>
            {loading == 'signature'
              ? (
                <div className='btn btn-disabled'>
                  <Spin size='small' />
								&nbsp;&nbsp;Loading...
                </div>
              )
              : (
                <div
                  className='btn'
                  onClick={onStaking}
                >
								Signature
                </div>
              )}
          </div>
          <div className={current == 'Nominate' ? 'nominate' : 'none'}>
            <div className='myinput'>
              <div className='tips'>
                <span>Consensus Account</span>
                {/* <label className={accountType == "polkdot" && accounts && accounts.length > 1 ? "none" : "none"} onClick={onSelectAccountForInput}>
									+
								</label> */}
              </div>
              <textarea
                className='textarea2'
                maxLength={49}
                onChange={(e) => onInput(e, 'nominate', 'address')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'nominate', 'address')}
                placeholder='cX'
              ></textarea>
            </div>
            <div className='myinput'>
              <div className='tips'>Staking Amount(CESS)</div>
              <textarea
                className='textarea1'
                maxLength={29}
                onChange={(e) => onInput(e, 'nominate', 'address')}
                onInput={(e) => onInput(e as React.ChangeEvent<HTMLTextAreaElement>, 'nominate', 'address')}
                placeholder='0'
              ></textarea>
            </div>
            <div className='t1'>Balance: {formatter.toLocaleString(available)} CESS</div>
            {loading == 'signature'
              ? (
                <div className='btn btn-disabled'>
                  <Spin size='small' />
								&nbsp;&nbsp;Loading...
                </div>
              )
              : (
                <div
                  className='btn'
                  onClick={onNominate}
                >
								Signature
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default styled(Home)<Props>`
  body {
    width: 440px;
    height: 600px;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    position: relative;
  }

  .none {
    display: none !important;
  }

  .acc-item {
    display: block;
    border: 1px solid #eee;
    padding: 10px;
    margin: 10px;
    cursor: pointer;

    label,
    span {
      display: block;
      overflow: hidden;
      clear: both;
      cursor: pointer;
    }

    label {
      color: #000;
      font-size: 16px;
    }

    span {
      font-size: 14px;
      color: #999;
    }

    &:hover {
      background-color: #e8faff;
    }
  }

  .dashboard {
    max-width: 600px;
    margin: 0px auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 80vh;
    color: white;

    .b1 {
      height: 120px;
      width: 100%;
      border-radius: 20px;
      overflow: hidden;
      background-image: url(${dashboardSvg});
      background-repeat: no-repeat;
      display: flex;
      flex-direction: column;
      position: relative;
      top: 0;

      .btn {
        position: absolute;
        top: 16px;
        right: 17px;
        cursor: pointer;
        background-image: url(${exitSvg});
        background-repeat: no-repeat;
        background-position: center;
        background-size: 20px;
        width: 20px;
        height: 20px;
        display: block;
        overflow: hidden;
      }

      .line {
        width: 99%;
        margin: 4px auto;
        display: block;
        overflow: hidden;
        text-align: center;
      }

      .l1 {
        font-size: 32px;
        font-weight: bold;
        line-height: 40px;
        height: 40px;
      }

      .l2 {
        font-size: 14px;
      }

      .l3 {
        display: flex;
        flex-direction: row;
        justify-content: center;

        .txt {
          line-height: 30px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .icon {
          margin-left: 2px;
          width: 30px;
          height: 30px;
          display: block;
          overflow: hidden;
          background-image: url(${copySvg});
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px;
          cursor: copy;
        }
      }

      .l4 {
        display: flex;
        flex-direction: row;
        justify-content: center;
        cursor: pointer;

        .icon {
          margin-right: 10px;
          width: 20px;
          height: 20px;
          display: block;
          overflow: hidden;
          background-image: url(${txPng});
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px;
        }

        .txt {
          font-size: 14px;
        }
      }
    }

    .b2 {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin: 20px 0;
      flex-wrap: wrap;

      .btn-box {
        width: 23.5%;
        height: 40px;
        display: block;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.59);
        border-radius: 10px;
        line-height: 40px;
        text-align: center;
        font-size: 12px;
        color: #eee;
        background-position: 10px;
        background-repeat: no-repeat;
        background-size: 12px;
        cursor: pointer;

        &:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }
      }

      .btn1 {
        background-image: url(${sendPng});
      }

      .btn2 {
        background-image: url(${receivePng});
      }

      .btn3 {
        background-image: url(${stakingPng});
      }

      .btn4 {
        background-image: url(${nominatePng});
      }
    }

    .b3 {
      height: 130px;
      border-radius: 10px;
      background-image: linear-gradient(-180deg, rgba(0, 0, 0, 0.59) 0%, rgba(0, 0, 0, 0.3) 97.63784887678702%);

      .b3-t {
        height: 25px;
        line-height: 25px;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
      }

      .tb {
        padding: 0 20px;

        .tr {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          height: 30px;
          line-height: 30px;
          font-size: 14px;
          color: #ffffff;

          span {
            color: rgba(255, 255, 255, 0.7);
          }

          label {
            text-align: right;
          }
        }
      }
    }

    .b4 {
      .t1 {
        font-size: 16px;
        display: block;
        overflow: hidden;
        clear: both;
        line-height: 40px;
        margin-top: 18px;
        text-indent: 4px;
      }

      .tb {
        display: block;

        .tr {
          padding: 10px 10px;
          border-radius: 10px;
          border: 1px solid #008cff;
          background-color: rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          font-size: 14px;
          margin: 8px 0;
          transition: all 1s;

          &:hover {
            background-color: rgba(0, 0, 0, 0.568);
          }

          .left {
            width: 50%;
            display: flex;
            flex-direction: column;

            .amount {
              font-size: 20px;
              height: 40px;
              line-height: 40px;

              .o-text {
                font-size: 20px;
                height: 40px;
                line-height: 40px;
                width: 123px;
                display: block;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                -o-text-overflow: ellipsis;
              }
            }

            .type {
              height: 20px;
              line-height: 20px;
            }
          }

          .right {
            width: 50%;
            text-align: right;
            display: flex;
            flex-direction: column;

            span {
              height: 20px;
              line-height: 20px;
              cursor: copy;
            }

            label {
              height: 20px;
              line-height: 20px;
              cursor: copy;
            }

            font {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.39);
            }
          }
        }
      }

      .pager {
        width: 250px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 40px auto 100px;

        div {
          width: 50px;
          height: 50px;
          display: block;
          overflow: hidden;
          background-image: url(https://cess.cloud/theme/cess/img/v6.0/mobile/down.png);
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px;
          background-color: #1b2732;
          border-radius: 50px;
          cursor: pointer;
          border: 1px solid #8d9398;

          &:hover {
            background-color: #28435c;
          }
        }

        .pre {
          transform: rotate(90deg);
        }

        .next {
          transform: rotate(-90deg);
        }
      }
    }
  }

  .box-out {
    display: block;
    padding: 10px;
    color: white;

    .box {
      max-width: calc(500px - 6%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3%;
      border-radius: 15px;
      background-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.11);

      .top-header {
        width: 100%;
        height: 50px;
        line-height: 50px;
        position: relative;
        text-align: center;
        font-size: 20px;
        margin-bottom: 0px;

        .back {
          position: absolute;
          left: 20px;
          top: 15px;
          background-image: url(${backPng});
          width: 20px;
          height: 20px;
          display: block;
          overflow: hidden;
          cursor: pointer;
          background-position: center;
          background-repeat: no-repeat;
          background-size: 20px;
        }
      }

      .myinput {
        padding: 10px;
        border-radius: 10px;
        border: 1px solid #008cff;
        background-color: rgba(255, 255, 255, 0);
        color: #999999;
        margin-top: 20px;

        .tips {
          color: rgba(255, 255, 255, 0.59);
          font-size: 14px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          span {
            color: rgba(255, 255, 255, 0.59);
            font-size: 14px;
          }

          label {
            width: 19px;
            height: 19px;
            background-color: #00bcd4;
            color: #ffffff;
            border-radius: 100%;
            display: block;
            overflow: hidden;
            text-align: center;
            line-height: 16px;
            font-size: 18px;
            cursor: pointer;
          }
        }

        textarea {
          background-color: transparent;
          border: none;
          outline: none;
          width: 100%;
          color: #adadad;
        }

        .textarea1 {
          height: 70px;
          line-height: 30px;
          font-size: 40px;
        }

        .textarea2 {
          height: 60px;
          line-height: 20px;
          font-size: 18px;
        }
      }

      .t1 {
        font-size: 14px;
        line-height: 34px;
        height: 34px;
      }

      .btn {
        height: 58px;
        line-height: 58px;
        border-radius: 190px;
        background-image: linear-gradient(-90deg, #075aff 0%, #3290f4 100%);
        font-size: 16px;
        text-align: center;
        margin-top: 10px;
        cursor: pointer;

        &:hover {
          background-image: linear-gradient(-90deg, #206afd 0%, #2070c5 100%);
        }
      }

      .btn-disabled {
        cursor: not-allowed;
        background-image: linear-gradient(-90deg, #374049 0%, #acacac 100%);

        &:hover {
          background-image: linear-gradient(-90deg, #374049 0%, #acacac 100%);
        }
      }

      .receive {
        .qr {
          width: 150px;
          height: 150px;
          display: block;
          overflow: hidden;
          margin: 3vw auto 2vw;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
        }

        .show-address {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #008cff;
          background-color: rgba(255, 255, 255, 0);
          color: #999999;
          margin-top: 20px;
          position: relative;
          top: 0;
          padding: 20px 10px;

          .tips {
            color: rgba(255, 255, 255, 0.59);
            font-size: 14px;
            height: 40px;
            line-height: 40px;
          }

          .address {
            font-size: 14px;
            line-height: 20px;
            color: #fff;
            word-wrap: break-word;
            width: 80%;
            display: block;
            overflow: hidden;
          }

          .btn-copy {
            background-image: url(${copyBlackPng});
            width: 40px;
            height: 40px;
            display: block;
            overflow: hidden;
            cursor: copy;
            position: absolute;
            top: 58px;
            right: 10px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: 20px;
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.7);

            &:hover {
              background-color: #fff;
            }
          }
        }
      }
    }
  }

  .headerPart {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .part1 {
      height: 25px;
      width: 100%;
      margin: 0px 0px -6px 2px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      color: white;
      vertical-align: middle;

      .content1 {
        font-size: 0.875rem; /* text-sm */
        font-weight: bold; /* font-bold */
        letter-spacing: -0.05em; /* tracking-tighter */
        color: white;
      }
    }

    .part2 {
      display: flex; /* flex */
      height: 90px; /* h-[90px] */
      width: 100%; /* w-[100%] */
      justify-content: center; /* justify-center */
    }

    .part3 {
      border-radius: 3px; /* rounded-[3px] */
      padding-top: 5px; /* py-[10px] */
      padding-bottom: 5px; /* py-[10px] */

      .content {
        display: flex; /* flex */
        flex-direction: column; /* flex-col */
        justify-content: center; /* justify-center */
        row-gap: 5px; /* gap-y-[5px] */

        .sub1 {
          border-radius: 10px; /* rounded-[10px] */
          padding: 5px; /* p-[5px] */
          background-color: white; /* bg-white */
          position: relative; /* relative */
        }

        .sub2 {
          display: flex; /* flex */
          flex-direction: column; /* flex-col */
          justify-content: center; /* justify-center */
          row-gap: 5px; /* gap-y-[5px] *

          .subContent1 {
            width: 100%; /* w-[100%] */
            display: flex; /* flex */
            justify-content: space-between; /* justify-between */

            .buttonClass {
              border: 1px solid #3c6c79; /* border and border-white */
              font-size: 14px; /* text-[14px] */
              width: 120px; /* w-[120px] */
              padding-top: 0.25rem; /* py-1 */
              padding-bottom: 0.25rem; /* py-1 */
              color: white; /* text-white */
              border-radius: 5px; /* rounded-[5px] */
              background-color: #447c88;
            }
          }

          .subContent2 {
            border: 1px solid #07385e; /* border and border-sky-800 */
            background-color: rgb(55, 64, 73); /* bg-white */
            padding-left: 5px; /* px-[5px] */
            padding-right: 5px; /* px-[5px] */
            padding-top: 0.25rem; /* py-1 */
            padding-bottom: 0.25rem; /* py-1 */
            font-size: 14px; /* text-[14px] */
            color: white; /* text-white */
            border-radius: 5px; /* rounded-[5px] */
            width: 100%; /* w-[100%] */
            display: block; /* block */
            box-sizing: border-box;
          }

          .subContent3 {
            cursor: pointer; /* cursor-pointer */
          }
        }
      }
    }

    .part4 {
      font-size: 12px; /* text-[12px] */
      font-weight: 900; /* font-black */
      color: white; /* text-white */
      letter-spacing: 0.1px; /* tracking-[0.1px] */
      display: block; /* block */
      text-align: center; /* text-center */
    }
  }

  .ant-notification-notice {
    padding: 8px 10px !important;
    width: max-content !important;
    text-align: left !important;
  }


  .ant-notification-notice-message {
    font-size: 14px !important;
    font-weight: 500;
    margin-bottom: 0px !important;
  }

  .ant-notification-notice-icon {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }

  .ant-notification-notice-close {
    right: 7px !important;
      top: 9px !important;
    width: 20px !important;
    height: 20px !important;
  }
`;
