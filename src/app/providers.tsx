'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {base, baseGoerli, mainnet, goerli, polygon, polygonMumbai} from 'viem/chains';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId="cm6vjpmqc00nte6wj3g9v1p0n"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}