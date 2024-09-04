// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import Axios from 'axios';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';

import { AccountContext, Button, InputWithLabel } from '../../components/index.js';
import { useTranslation } from '../../hooks/index.js';
import { Header } from '../../partials/index.js';
import { styled } from '../../styled.js';
import * as antdHelper from '../../util/antd-helper.js';
import AccountsTree from '../Accounts/AccountsTree.js';
import AddAccount from '../Accounts/AddAccount.js';

interface Props {
  className?: string;
}

function ManageSeed ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const [seed, setSeed] = useState('');
  const [note, setNote] = useState('');
  const [isBusyStore, setIsBusyStore] = useState<boolean>(false);
  const [isBusyLoad, setIsBusyLoad] = useState<boolean>(false);
  const { hierarchy } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);

  useEffect(() => {
    setFilteredAccount(
      filter
        ? hierarchy.filter((account) =>
          account.name?.toLowerCase().includes(filter) ||
          (account.genesisHash && networkMap.get(account.genesisHash)?.toLowerCase().includes(filter)) ||
          account.address.toLowerCase().includes(filter)
        )
        : hierarchy
    );
  }, [filter, hierarchy, networkMap]);

  const _onFilter = useCallback((filter: string) => {
    setFilter(filter.toLowerCase());
  }, []);

  const _onClickStore = useCallback(() => {
    setIsBusyStore(true);
    console.log('store -> ', seed);
    console.log('note -> ', note);
    Axios.post('https://deoss.anonid.io' + '/store_seed', {
      address: localStorage.getItem('cess_address'),
      seed,
      // eslint-disable-next-line sort-keys
      note
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          antdHelper.notiOK(res.data.msg);
        }
        else {
          antdHelper.noti(res.data.msg);
        }
      } else {
        antdHelper.noti('Backend Error: Not responding correctly');
      }
    }).catch((err) => {
      console.log('err', err);
      antdHelper.noti('Server Error. Please contact dev team');
    });
    setIsBusyStore(false);
  }, [note, seed]);

  const _onClickLoad = useCallback(() => {
    setIsBusyLoad(true);
    setSeed('');
    setNote('');
    Axios.post('https://deoss.anonid.io' + '/load_seed', {
      address: localStorage.getItem('cess_address')
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          antdHelper.notiOK(res.data.msg);
          setSeed(res.data.seed);
          setNote(res.data.note);
        }
        else {
          antdHelper.noti(res.data.msg);
        }
      } else {
        antdHelper.noti('Backend Error: Not responding correctly');
      }
    }).catch((err) => {
      console.log('err', err);
      antdHelper.noti('Server Error. Please contact dev team');
    });
    setIsBusyLoad(false);
  }, []);

  return (
    <>
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <Header
              onFilter={_onFilter}
              showAdd
              showConnectedAccounts
              showSearch
              showSettings
              text={t('Accounts')}
            />
            <div className={className}>
              {filteredAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  key={`${index}:${json.address}`}
                />
              ))}
              <InputWithLabel
                label={t('Seed field')}
                onChange={setSeed}
                value={seed}
              />
              <InputWithLabel
                label={t('Simple Note')}
                onChange={setNote}
                value={note}
              />
              <Button
                className='export-button'
                data-export-button
                isBusy={isBusyStore}
                onClick={_onClickStore}
              >
                {t('I want to store this seed')}
              </Button>
              <Button
                className='export-button'
                data-export-button
                isBusy={isBusyLoad}
                onClick={_onClickLoad}
              >
                {t('I want to load seed for id')}
              </Button>
            </div>
          </>
        )
      }
    </>
  );
}

export default styled(ManageSeed)<Props>`
  height: calc(100vh - 2px);
  overflow-y: scroll;
  margin-top: -25px;
  padding-top: 25px;
  scrollbar-width: none;

  .export-button {
    margin-top: 6px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;
