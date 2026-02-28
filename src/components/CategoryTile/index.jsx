import { Link } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import styles from "./CategoryTile.module.scss";

export const CategoryTile = ({ id, label }) => (
  <Link to={`/cardapio#cat-${id}`} className={styles.tile}>
    <span className={styles.label}>{label}</span>
    <MdChevronRight className={styles.arrow} size={20} />
  </Link>
);
