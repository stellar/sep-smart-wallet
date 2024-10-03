import { Layout } from "@stellar/design-system";
import { DebugTab, useDemoStore } from "@/store/useDemoStore";
import { Box } from "@/components/layout/Box";
import { Tab } from "@/components/Tab";
import { DebugSep10c } from "@/components/DebugSep10c";
import { DebugPasskey } from "@/components/DebugPasskey";

export const DemoDebugger = () => {
  const { debugTab, setDebugTab } = useDemoStore();

  const TABS: { id: DebugTab; label: string }[] = [
    {
      id: "sep10c",
      label: "SEP-10c Debugger",
    },
    {
      id: "passkey",
      label: "Passkey Debugger",
    },
  ];

  return (
    <>
      <Layout.Inset>
        <Box gap="xl">
          {/* Tabs */}
          <Box gap="xs" direction="row" align="center">
            <>
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  isSelected={debugTab === tab.id}
                  onClick={() => {
                    setDebugTab(tab.id);
                  }}
                />
              ))}
            </>
          </Box>

          {/* Tab content */}
          {debugTab === "sep10c" ? <DebugSep10c /> : <DebugPasskey />}
        </Box>
      </Layout.Inset>
    </>
  );
};
