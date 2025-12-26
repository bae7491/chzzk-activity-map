import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import Header from "../../components/Header/Header";
import "../DayDetail/DayDetail.css";

const FALLBACK_THUMB =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
      <rect width="100%" height="100%" fill="#1f2937"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="#9ca3af" font-family="Arial" font-size="24">
        No Thumbnail
      </text>
    </svg>
  `);

const cardBaseStyle = {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: 14,
    padding: 14,
    borderRadius: 16,

    background: "var(--card)",
    border: "1px solid var(--card-border)",
    boxShadow: "0 6px 20px var(--shadow)",

    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",

    transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
};

const cardHoverStyle = {
    transform: "translateY(-3px)",
    boxShadow: "0 14px 40px var(--shadow)",
};

/* -----------------------
 * helpers
 * ---------------------- */
const secToHms = (sec) => {
    const s = Number(sec) || 0;
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad2 = (n) => String(n).padStart(2, "0");
    return hh > 0 ? `${hh}:${pad2(mm)}:${pad2(ss)}` : `${mm}:${pad2(ss)}`;
};

const unique = (arr) => Array.from(new Set((arr ?? []).filter(Boolean)));

async function fetchVideoDetail(videoNo, { signal } = {}) {
    const url = `/service/v2/videos/${videoNo}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json?.code !== 200) throw new Error(`API code ${json?.code}`);
    return json?.content;
}

export default function DayDetail() {
    const nav = useNavigate();
    const { state } = useLocation();

    // Home에서 넘기는 값 예시:
    // navigate("/dayDetail", { state: { date: "2025-04-21", videoNos: ["6888238","...."] } })
    const date = state?.date ?? null;
    const videoNos = useMemo(() => unique(state?.videoNos), [state]);

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]); // [{ videoNo, data?, error? }]
    const reqIdRef = React.useRef(0);

    const isLoading = items.length > 0 && items.some((it) => !it.data && !it.error);

    useEffect(() => {
        const controller = new AbortController();
        const myReqId = ++reqIdRef.current;

        // state 없이 직접 /dayDetail 들어온 경우 대비
        if (!videoNos.length) {
            setItems([]);
            setLoading(false);
            return () => controller.abort();
        }

        setLoading(true);
        setItems(videoNos.map((vn) => ({ videoNo: vn, data: null, error: null })));

        (async () => {
            // 여러 개이므로 병렬로 호출 (부분 성공 허용)
            const results = await Promise.allSettled(
                videoNos.map((vn) => fetchVideoDetail(vn, { signal: controller.signal }))
            );

            if (controller.signal.aborted || reqIdRef.current !== myReqId) return;

            const next = results.map((r, idx) => {
                const vn = videoNos[idx];
                if (r.status === "fulfilled") return { videoNo: vn, data: r.value, error: null };

                // AbortError는 "실패"로 표시하지 않음(StrictMode/페이지전환 시 정상)
                const name = r.reason?.name;
                if (name === "AbortError") return { videoNo: vn, data: null, error: null };

                return { videoNo: vn, data: null, error: r.reason?.message ?? "failed" };
            });

            // 노출/정렬: publishDateAt 내림차순(최신 위)
            next.sort((a, b) => (b.data?.publishDateAt ?? 0) - (a.data?.publishDateAt ?? 0));

            setItems(next);
        })()
            .catch((e) => {
                if (e.name !== "AbortError") console.error(e);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [videoNos]);

    return (
        <div className="app">
            <div className="header-block">
                <Header
                    title="다시보기 목록"
                    right={
                        <button className="channel-search-btn" onClick={() => nav(-1)}>
                            뒤로가기
                        </button>
                    }
                />
                <div className="page-description">
                    {date ? `${date.replace(/-/g, ".")} 다시보기 상세` : "날짜 상세"}{" "}
                    {videoNos.length ? `(총 ${videoNos.length}개)` : ""}
                </div>
            </div>

            <div className="heatmap-container" style={{ paddingBottom: 18, position: "relative" }}>
                {(loading || isLoading) && (
                    <div className="heatmap-loading-overlay">
                        <ClipLoader size={42} color="#22c55e" />
                        <div className="heatmap-loading-text">데이터 불러오는 중...</div>
                    </div>
                )}


                {!videoNos.length && (
                    <div className="heatmap-loading-text">
                        전달된 videoNo가 없습니다. (Home에서 navigate state 확인)
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                    {items.map(({ videoNo, data, error }) => {
                        if (error) {
                            return (
                                <div key={videoNo} style={{
                                    padding: 14, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)",
                                    background: "rgba(239,68,68,0.08)"
                                }}>
                                    <div style={{ fontWeight: 800 }}>videoNo: {videoNo}</div>
                                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
                                        불러오기 실패: {error}
                                    </div>
                                </div>
                            );
                        }

                        if (!data) {
                            return (
                                <div key={videoNo} style={{
                                    padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)",
                                    background: "rgba(0,0,0,0.03)"
                                }}>
                                    <div style={{ fontWeight: 800 }}>videoNo: {videoNo}</div>
                                    <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>대기 중...</div>
                                </div>
                            );
                        }

                        const ch = data.channel;
                        return (
                            <a
                                key={data.videoNo}
                                href={`https://chzzk.naver.com/video/${data.videoNo}`}
                                target="_blank"
                                rel="noreferrer"
                                style={cardBaseStyle}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.boxShadow = "";
                                    e.currentTarget.style.filter = "";
                                }}
                            >
                                <div style={{ borderRadius: 14, overflow: "hidden" }}>
                                    <img
                                        src={data.thumbnailImageUrl || FALLBACK_THUMB}
                                        alt={data.videoTitle}
                                        style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = FALLBACK_THUMB;
                                        }}
                                    />
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 900, lineHeight: 1.2 }}>
                                        {data.videoTitle}
                                    </div>

                                    <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <span>길이: <b>{secToHms(data.duration)}</b></span>
                                        <span>
                                            조회수: <b>{(data.readCount ?? 0).toLocaleString()}회</b>
                                        </span>
                                        {data.videoCategoryValue ? <span>카테고리: <b>{data.videoCategoryValue}</b></span> : null}
                                    </div>

                                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                                        게시: {data.publishDate}
                                    </div>

                                    {Array.isArray(data.tags) && data.tags.length > 0 && (
                                        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {data.tags.slice(0, 10).map((t) => (
                                                <span key={t} style={{
                                                    fontSize: 12,
                                                    padding: "3px 10px",
                                                    borderRadius: 999,
                                                    border: "1px solid rgba(34,197,94,0.35)",
                                                    background: "rgba(34,197,94,0.12)",
                                                }}>
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {ch?.channelId && (
                                        <a
                                            href={`https://chzzk.naver.com/${ch.channelId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="치지직 채널로 이동"
                                            className="channel-link-btn"
                                            onClick={(e) => e.stopPropagation()} // 카드 클릭과 완전 분리
                                        >
                                            {ch.channelImageUrl && (
                                                <img
                                                    src={ch.channelImageUrl}
                                                    alt={ch.channelName}
                                                />
                                            )}
                                            <span>{ch.channelName ?? ch.channelId}</span>
                                        </a>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}