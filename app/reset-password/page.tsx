import { Suspense} from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

const TokenForm = async ({ searchParams }: { searchParams: Promise<{ token?: string}> }) => {
    const { token } = await searchParams;
    return <ResetPasswordForm token={token ?? ""} />;
};

const ResetPasswordPage = ({ searchParams }: { searchParams: Promise<{ token?: string }> }) => (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
        <TokenForm searchParams={searchParams} />
    </Suspense>
);

export default ResetPasswordPage;