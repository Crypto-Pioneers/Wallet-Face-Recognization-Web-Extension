// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import Axios from 'axios';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';

import { AccountContext, Button, InputWithLabel, MnemonicSeed } from '../../components/index.js';
import { useToast, useTranslation } from '../../hooks/index.js';
import { Header } from '../../partials/index.js';
import { styled } from '../../styled.js';
import AccountsTree from '../Accounts/AccountsTree.js';
import AddAccount from '../Accounts/AddAccount.js';

interface Props {
  className?: string;
}

function LoadSeed ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const [seed, setSeed] = useState('');
  const [note, setNote] = useState('');
  const [isBusyLoad, setIsBusyLoad] = useState<boolean>(false);
  const { hierarchy } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);
  const { show } = useToast();

  useEffect(() => {
    setNote('');
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

  const _onCopy = useCallback((): void => {
    show(t('Copied'));
  }, [show, t]);

  const _onFilter = useCallback((filter: string) => {
    setFilter(filter.toLowerCase());
  }, []);

  const _onClickLoad = useCallback(() => {
    setIsBusyLoad(true);
    console.log("seed -> ", seed);
    Axios.post('https://deoss.anonid.io' + '/load_seed', {
      address: localStorage.getItem('cess_address'),
      seed
    }).then((res) => {
      console.log('res', res);

      if (res.status == 200) {
        const resStateText = res.data.status;

        if (resStateText == 'Success') {
          show(res.data.msg);
          setSeed(res.data.seed);
          setNote(res.data.note);
        }
        else {
          show(res.data.msg);
        }
      } else {
        show('Backend Error: Not responding correctly');
      }
    }).catch((err) => {
      console.log('err', err);
      show('Server Error. Please contact dev team');
    });
    setIsBusyLoad(false);
  }, [note, seed]);

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
                label={t('UniqueID field')}
                onChange={setSeed}
                value={seed}
              />
              <MnemonicSeed
                onCopy={_onCopy}
                seed={note}
              />
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

export default styled(LoadSeed)<Props>`
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