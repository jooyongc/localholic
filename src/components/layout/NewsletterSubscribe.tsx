"use client";

import { useState, type FormEvent } from "react";

// 레터 앱(jooyongc/localholic-letter) 주소. 예: https://localholic-letter.pages.dev. 비어 있으면 폼을 그리지 않는다.
const LETTER_URL = process.env.NEXT_PUBLIC_LETTER_URL?.replace(/\/+$/, "");

type Status = { tone: "success" | "error"; text: string } | null;

/**
 * 로컬홀릭 레터 구독 폼.
 * 정보통신망법: 「광고성 정보 수신동의」를 개인정보 수집·이용 동의와 따로, 기본 해제 상태로 받는다.
 * 신청 후 확인 메일의 버튼을 눌러야 구독이 완료된다(더블 옵트인).
 */
export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentAd, setConsentAd] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  if (!LETTER_URL) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${LETTER_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent_privacy: consentPrivacy, consent_ad: consentAd, website }),
      });
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        setStatus({ tone: "success", text: body.message ?? "확인 메일을 보냈습니다." });
        setEmail("");
        setConsentAd(false);
        setConsentPrivacy(false);
      } else {
        setStatus({ tone: "error", text: body.message ?? "구독 신청에 실패했습니다. 잠시 후 다시 시도해 주세요." });
      }
    } catch {
      setStatus({ tone: "error", text: "구독 신청에 실패했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-background p-5" aria-labelledby="letter-subscribe-title">
      <h3 id="letter-subscribe-title" className="text-sm font-semibold text-foreground">
        로컬홀릭 레터 구독
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">2주에 한 번, 지역의 이야기와 제철 로컬 소식을 메일로 보내드려요.</p>

      <div className="mt-3 flex gap-2">
        <label htmlFor="letter-email" className="sr-only">
          이메일
        </label>
        <input
          id="letter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !consentPrivacy || !consentAd}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {busy ? "신청 중…" : "구독"}
        </button>
      </div>

      {/* 봇 차단용 숨은 칸: 사람에게는 보이지 않는다 */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          웹사이트
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <div className="mt-3 space-y-2 text-xs text-muted">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} />
          <span>
            <strong className="text-foreground">[필수] 개인정보 수집·이용 동의</strong> — 수집 항목: 이메일 주소 / 목적: 로컬홀릭 레터 발송 / 보유
            기간: 수신거부 시까지(거부 후 지체 없이 파기). 동의를 거부할 수 있으며, 이 경우 레터를 받을 수 없습니다.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5" checked={consentAd} onChange={(e) => setConsentAd(e.target.checked)} />
          <span>
            <strong className="text-foreground">[필수] 광고성 정보 수신동의 (이메일)</strong> — 로컬홀릭의 상품·여행·이벤트 소식이 담긴 레터를 이메일로
            받습니다. 언제든 메일 하단에서 수신거부할 수 있습니다.
          </span>
        </label>
      </div>

      {status && (
        <p role={status.tone === "error" ? "alert" : "status"} className={`mt-3 text-xs ${status.tone === "error" ? "text-red-600" : "text-primary"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}
