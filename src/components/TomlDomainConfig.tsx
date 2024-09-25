import { Button, Card, Input, Modal, Notification } from "@stellar/design-system";

import { Box } from "@/components/layout/Box";
import { useTomlDomainStore } from "@/store/useTomlDomainStore";
import { useEffect, useState } from "react";
import { Validate } from "@/helpers/Validate";

export const TomlDomainConfig = () => {
  const [isUpdateTomlModalVisible, setUpdateTomlModalVisible] = useState(false);
  const [isResetTomlModalVisible, setResetTomlModalVisible] = useState(false);

  const { tomlDomain, setTomlDomain } = useTomlDomainStore();
  const tomlSource = tomlDomain ?? "Local Mock";

  return (
    <>
      <Box gap="lg">
        <Box gap="md" direction="row" align="center">
          <Card>Toml source: {tomlSource}</Card>
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              setUpdateTomlModalVisible(true);
            }}
            disabled={false}
          >
            Update
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

      <UpdateTomlModal
        visible={isUpdateTomlModalVisible}
        onClose={() => setUpdateTomlModalVisible(false)}
        onConfirm={(newToml) => {
          setUpdateTomlModalVisible(false);
          setTomlDomain(newToml);
        }}
      />

      <ResetTomlModal
        visible={isResetTomlModalVisible}
        onClose={() => setResetTomlModalVisible(false)}
        onConfirm={() => {
          setResetTomlModalVisible(false);
          setTomlDomain(null);
        }}
      />
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
          placeholder="http://localhost:8080"
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

interface ResetTomlModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetTomlModal: React.FC<ResetTomlModalProps> = ({ visible, onClose, onConfirm }: ResetTomlModalProps) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>Reset Toml Domain</Modal.Heading>

      <Modal.Body>Are you sure you want to reset the Toml domain?</Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="secondary" type="reset" onClick={onClose}>
          Cancel
        </Button>

        <Button size="sm" variant="destructive" type="submit" onClick={onConfirm}>
          Reset
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
