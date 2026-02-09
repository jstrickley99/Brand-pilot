import { PageHeader } from "@/components/layout/page-header";
import { AccountCard } from "@/components/accounts/account-card";
import { ConnectCard } from "@/components/accounts/connect-card";
import { mockAccounts } from "@/lib/mock-data";

export default function AccountsPage() {
  const connectedCount = mockAccounts.filter((a) => a.status === "connected").length;
  const maxAccounts = 10;

  return (
    <div>
      <PageHeader title="Accounts" description="Manage your connected Instagram accounts">
        <span className="text-sm border border-[#1E3A5F] rounded-full px-3 py-1.5 text-gray-300">
          {connectedCount}/{maxAccounts} connected
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockAccounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
        <ConnectCard />
      </div>
    </div>
  );
}
