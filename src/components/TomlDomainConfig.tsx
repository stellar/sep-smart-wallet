import { Button, Heading, Input, Modal, Notification } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { useTomlDomainStore } from "@/store/useTomlDomainStore";
import { useEffect, useState } from "react";
import { Validate } from "@/helpers/Validate";
import { ConfirmationModal } from "./ConfirmationModal";

export const TomlDomainConfig = () => {
  const [isUpdateTomlModalVisible, setUpdateTomlModalVisible] = useState(false);
  const [isResetTomlModalVisible, setResetTomlModalVisible] = useState(false);

  const { tomlDomain, setTomlDomain } = useTomlDomainStore();
  const tomlSource = tomlDomain ?? "Local Mock";

  return (
    <>
      <Box gap="lg">
        <Box gap="md" direction="row" align="center" justify="space-between">
          <Heading size="md" as="h4">
            Toml domain: {tomlSource}
          </Heading>
          <Box gap="md" direction="row" align="center">
            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setUpdateTomlModalVisible(true);
              }}
              disabled={false}
            >
              Update Toml
            </Button>
            <Button
              size="md"
              variant="destructive"
              onClick={() => {
                setResetTomlModalVisible(true);
              }}
              disabled={!tomlDomain}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Box>

      <UpdateTomlModal
        visible={isUpdateTomlModalVisible}
        onClose={() => setUpdateTomlModalVisible(false)}
        onConfirm={(newToml) => {
          setUpdateTomlModalVisible(false);
          setTomlDomain(newToml);
        }}
      />

      <ConfirmationModal
        title="Reset Toml Domain"
        visible={isResetTomlModalVisible}
        onClose={() => setResetTomlModalVisible(false)}
        onConfirm={() => {
          setResetTomlModalVisible(false);
          setTomlDomain(null);
        }}
      >
        Are you sure you want to reset the Toml domain?
      </ConfirmationModal>
    </>
  );
};

interface UpdateTomlModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (newToml: string) => void;
}

const UpdateTomlModal: React.FC<UpdateTomlModalProps> = ({ visible, onClose, onConfirm }: UpdateTomlModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [newTomlValue, setNewTomlValue] = useState("");
  const onTomlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTomlValue(e.target.value.trim());
    setErrorMessage("");
  };

  useEffect(() => {
    if (!visible) {
      setNewTomlValue("");
      setErrorMessage("");
    }
  }, [visible]);

  const handleCancel = () => {
    setNewTomlValue("");
    setErrorMessage("");
    onClose();
  };

  const handleConfirm = () => {
    const clonedValue = "" + newTomlValue;
    if (!Validate.url(clonedValue)) {
      setErrorMessage("Invalid URL");
      return;
    }
    onConfirm(clonedValue);
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>Update Toml Domain</Modal.Heading>

      <Modal.Body>
        {errorMessage ? (
          <Notification variant="error" title="Error">
            {errorMessage}
          </Notification>
        ) : null}

        <Input
          id="tomlUrl"
          fieldSize="md"
          type="text"
          label="Toml domain"
          placeholder="https://example.domain.com"
          value={newTomlValue}
          onChange={onTomlChange}
          error={!!errorMessage}
        ></Input>
      </Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="secondary" type="reset" onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          size="sm"
          variant="primary"
          type="submit"
          disabled={!newTomlValue || !!errorMessage}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
