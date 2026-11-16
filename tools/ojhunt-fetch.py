#!/usr/bin/env python3
"""拉取多个 OJ 的做题统计，写成 Hugo 能直接读的 data/ojhunt.json。

为什么需要这个脚本：OJHunt Lite 是 Python 爬虫，静态站没法在浏览器里跑它。
所以由 CI 在构建前跑一次，把结果落成 JSON，Hugo 构建时读这个 JSON 渲染「进程」页。

用法:
    python tools/ojhunt-fetch.py                     # 读 ojhunt.config.yaml，写 data/ojhunt.json
    python tools/ojhunt-fetch.py --dry-run           # 只打印将要执行的命令，不联网
    python tools/ojhunt-fetch.py --from-json x.json  # 不联网，只做后处理（测试用）
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = ROOT / "ojhunt.config.yaml"
DEFAULT_OUTPUT = ROOT / "data" / "ojhunt.json"

# 只保留页面要用的字段。solved_list 是几千个题目 ID，留着会让 JSON 和提交记录白白变胖
KEEP_FIELDS = ("crawler", "title", "username", "success", "solved", "submissions", "error")


def load_config(path: Path) -> dict:
    """读取配置。.json 用标准库，.yaml 需要 pyyaml（CI 里会装）。"""
    if not path.exists():
        raise SystemExit(f"找不到配置文件：{path}")
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".json":
        return json.loads(text)
    try:
        import yaml
    except ImportError:
        raise SystemExit(
            "读 YAML 配置需要 pyyaml。\n"
            "  python -m pip install pyyaml\n"
            "（CI 里已经装了；本地只是想看看命令长什么样，可以先装这个包。）"
        ) from None
    return yaml.safe_load(text) or {}


def collect_targets(config: dict) -> list[str]:
    """把 accounts 转成 ojhunt 要的 username@crawler 参数，跳过没填完的。"""
    targets: list[str] = []
    for index, account in enumerate(config.get("accounts") or [], start=1):
        if not isinstance(account, dict):
            print(f"跳过第 {index} 项：格式应该是带 crawler / username 的映射", file=sys.stderr)
            continue
        crawler = str(account.get("crawler") or "").strip()
        username = str(account.get("username") or "").strip()
        if not crawler or not username:
            # 空 username 是“还没填”的正常状态，不是错误，所以只提示不报错
            print(f"跳过第 {index} 项：crawler 或 username 为空", file=sys.stderr)
            continue
        targets.append(f"{username}@{crawler}")
    return targets


def ojhunt_command(targets: list[str]) -> list[str]:
    """拼出执行 ojhunt 的命令。

    优先用当前解释器的模块形式（python -m ojhunt）：CI 里 pip 有时会把脚本装到
    ~/.local/bin 这种不在 PATH 上的目录，直接调 `ojhunt` 会找不到，而模块形式始终指向
    装了包的那个解释器。
    """
    if importlib.util.find_spec("ojhunt") is not None:
        return [sys.executable, "-m", "ojhunt", "--json", *targets]

    exe = shutil.which("ojhunt")
    if exe is not None:
        return [exe, "--json", *targets]

    raise SystemExit(
        "没有找到 ojhunt。安装：\n"
        "  python -m pip install ojhunt\n"
        "  # 或 pipx install ojhunt"
    )


def run_ojhunt(targets: list[str]) -> dict:
    """执行 ojhunt --json，返回解析后的结果。"""
    cmd = ojhunt_command(targets)
    print("执行：" + " ".join(cmd), file=sys.stderr)
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")

    # --json 模式下进度信息走 stderr，转出来方便在 Actions 日志里看
    if proc.stderr.strip():
        print(proc.stderr.rstrip(), file=sys.stderr)

    if not proc.stdout.strip():
        raise SystemExit(f"ojhunt 没有输出 JSON（退出码 {proc.returncode}）")
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ojhunt 输出的不是合法 JSON：{exc}") from None


def normalize(payload: dict, generated_at: str | None = None) -> dict:
    """裁剪 + 补时间戳，得到最终写盘的形状。"""
    results = [
        {field: raw[field] for field in KEEP_FIELDS if field in raw}
        for raw in (payload.get("results") or [])
    ]
    summary = payload.get("summary") or {}
    ok = sum(1 for r in results if r.get("success"))
    return {
        "generated_at": generated_at
        or datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source": "ojhunt-lite",
        "results": results,
        "summary": {
            "unique_solved": summary.get("unique_solved", 0),
            "total_submissions": summary.get("total_submissions", 0),
            "ok": summary.get("ok", ok),
            "failed": summary.get("failed", len(results) - ok),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="把 OJHunt Lite 的查询结果写成 data/ojhunt.json")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG, help="账号配置（默认 ojhunt.config.yaml）")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="输出路径（默认 data/ojhunt.json）")
    parser.add_argument("--dry-run", action="store_true", help="只打印将要执行的命令，不联网、不写文件")
    parser.add_argument("--from-json", type=Path, help="跳过抓取，直接后处理一个已有的 ojhunt JSON")
    args = parser.parse_args()

    if args.from_json:
        payload = json.loads(args.from_json.read_text(encoding="utf-8"))
    else:
        targets = collect_targets(load_config(args.config))
        if not targets:
            print("没有需要查询的账号（ojhunt.config.yaml 里的 username 都是空的？）", file=sys.stderr)
            return 0
        if args.dry_run:
            print("将要执行：ojhunt --json " + " ".join(targets))
            return 0
        payload = run_ojhunt(targets)

    data = normalize(payload)
    summary = data["summary"]

    # 一个都没成功时保留上一次的好数据，别用一堆空值把页面覆盖掉
    if summary["ok"] == 0 and summary["failed"] > 0:
        print(
            f"所有 {summary['failed']} 个平台都查询失败，保留原有 {args.output} 不动。",
            file=sys.stderr,
        )
        return 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"写入 {args.output}：{summary['unique_solved']} 题 / "
        f"{summary['total_submissions']} 次提交"
        f"（{summary['ok']} 成功，{summary['failed']} 失败）"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
