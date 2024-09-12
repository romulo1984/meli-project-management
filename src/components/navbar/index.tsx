"use client";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="container mx-auto max-w-screen-xl py-6 px-6 flex justify-between">
      <h1 className="text-2xl md:text-3xl font-bold">
        <a href="/">
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">retro</span>
          <span className="text-pink-400">spec</span>
          <span className="text-indigo-400">tool</span>
        </a>
      </h1>
      <div className="flex justify-end items-center">
        {isSignedIn ? (
          <>
            <Link className="mr-6 text-slate-600" href="/new">
              New
            </Link>
            <Link className="mr-6 text-slate-600" href="/retros">
              My Retros
            </Link>
            <UserButton />
          </>
        ) : (
          <SignInButton mode="modal" className="text-slate-600" />
        )}
      </div>
    </nav>
  );
}
