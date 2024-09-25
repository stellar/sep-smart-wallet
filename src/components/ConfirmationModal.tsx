import { Button, Modal } from "@stellar/design-system";

interface ConfirmationModalProps {
  title: string;
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  children,
  onClose,
  onConfirm,
}: ConfirmationModalProps) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>{title}</Modal.Heading>

      <Modal.Body>{children}</Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="secondary" type="reset" onClick={onClose}>
          Cancel
        </Button>

        <Button size="sm" variant="primary" type="submit" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
