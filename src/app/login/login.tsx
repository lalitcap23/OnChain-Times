"use client";

import { useLogin } from "@privy-io/react-auth";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function Login() {
  const router = useRouter();
  const { login } = useLogin({
    // change this after implementation of submitNews and other
    onComplete: () => router.push("/home"),
  });

  const { ready, authenticated, logout, user } = usePrivy();

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="flex min-h-screen min-w-full">
        <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
          <div className="mt-6 flex justify-center text-center">
            <button
              className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg"
              onClick={login}
            >
              Log in
            </button>
          </div>
          {/* {authenticated ? (
            <>
              <p>Connected as: {user?.wallet?.address}</p>
              <button
                onClick={logout}
                className="bg-red-500 p-2 text-white rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-blue-500 p-2 text-white rounded"
            >
              Login with Privy
            </button>
          )} */}
        </div>
      </main>
    </>
  );
}
