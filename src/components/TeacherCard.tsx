import {
  BookOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import styles from "./TeacherCard.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeacherCardData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  position?: string;
  academicLevel?: string;
  department?: { name?: string };
  specialization?: string;
  subjects?: string[];
  schedule?: string;
}

interface TeacherCardProps {
  teacher: TeacherCardData;
  accentColor?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TeacherCard({
  teacher,
  accentColor = "#4f3fc5",
}: TeacherCardProps) {
  const fullName = `${teacher.firstName} ${teacher.lastName}`;
  const initials = `${teacher.firstName?.[0] ?? ""}${teacher.lastName?.[0] ?? ""}`;

  return (
    <div className={styles.tc}>
      {/* Foto / placeholder */}
      <div className={styles.tcBg}>
        {teacher.avatar ? (
          <img src={teacher.avatar} alt={fullName} className={styles.tcImg} />
        ) : (
          <div
            className={styles.tcPlaceholder}
            style={{
              background: `linear-gradient(145deg, ${lighten(accentColor, 0.55)}, ${lighten(accentColor, 0.35)})`,
            }}
          >
            <div
              className={styles.avatarCircle}
              style={{ background: accentColor }}
            >
              {initials}
            </div>
          </div>
        )}
      </div>

      {/* Spec pill */}
      {teacher.specialization && (
        <span className={styles.specPill} style={{ background: accentColor }}>
          {teacher.specialization}
        </span>
      )}

      {/* Overlay — dentro da imagem, expande para cima no hover */}
      <div className={styles.tcOverlay}>
        <div className={styles.tcBase}>
          <div className={styles.tcHeader}>
            <div>
              <p className={styles.tcName}>{fullName}</p>
              <p className={styles.tcPos}>
                {teacher.position ?? "Professor"}
                {teacher.department?.name
                  ? ` · ${teacher.department.name}`
                  : ""}
              </p>
            </div>
            <div className={styles.menuDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>

          {teacher.subjects && teacher.subjects.length > 0 && (
            <div className={styles.tcBadges}>
              {teacher.subjects.slice(0, 2).map((s) => (
                <Tag key={s} icon={<BookOutlined />} className={styles.badge}>
                  {s}
                </Tag>
              ))}
              {teacher.subjects.length > 2 && (
                <Tag className={`${styles.badge} ${styles.badgeMore}`}>
                  +{teacher.subjects.length - 2}
                </Tag>
              )}
            </div>
          )}
        </div>

        {/* Secção expandida — visível só no hover */}
        <div className={styles.tcExpand}>
          <div className={styles.divider} />
          {teacher.schedule && (
            <InfoRow icon={<ClockCircleOutlined />} text={teacher.schedule} />
          )}
          {teacher.academicLevel && (
            <InfoRow icon={<UserOutlined />} text={teacher.academicLevel} />
          )}
          {teacher.email && (
            <InfoRow icon={<MailOutlined />} text={teacher.email} />
          )}
          {teacher.phoneNumber && (
            <InfoRow icon={<PhoneOutlined />} text={teacher.phoneNumber} />
          )}
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.iico}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default TeacherCard;
