import { Modal } from "antd";
import ReactMarkdown from "react-markdown";
import avisoLegalContent from "../content/avisoLegal.md?raw";
import styles from "./AvisoLegalModal.module.scss";

export default function AvisoLegalModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      <div className={styles.content}>
        <ReactMarkdown>{avisoLegalContent}</ReactMarkdown>
      </div>
    </Modal>
  );
}
