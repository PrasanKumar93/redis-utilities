import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/redis.png"
          alt="Redis Logo"
          width={250}
          height={79}
          priority
        />
      </div>

      <div className={styles.grid}>
        <a
          href="/import"
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2 className="font-bold" >
            Import Tool
          </h2>
          <p>Import JSON documents in to Redis </p>
        </a>

        <a
          href="/"
          className={styles.card + " " + styles.disabled}
          rel="noopener noreferrer"
        >
          <h2 className="font-bold" >
            Export Tool
          </h2>
          <p>TBD</p>
        </a>

        <a
          href="/"
          className={styles.card + " " + styles.disabled}
          rel="noopener noreferrer"
        >
          <h2 className="font-bold" >
            Vector Tool
          </h2>
          <p>TBD</p>
        </a>

        <a
          href="/"
          className={styles.card + " " + styles.disabled}
          rel="noopener noreferrer"
        >
          <h2 className="font-bold" >
            Tutorials
          </h2>
          <p>
            TBD (How to import, export, vector conversion etc.)
          </p>
        </a>
      </div>
    </main>
  );
}
