import Timer from "../../utils/testTimer";

export default function Header() {
  return (
    <header className="header">
      <h1>Làm bài</h1>
      <h2>DUOMATH Test - Reading Test 1</h2>
      <div className="timer">
        ⏱ <Timer />
      </div>
    </header>
  );
}