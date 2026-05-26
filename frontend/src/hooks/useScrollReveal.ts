import { useEffect, useRef } from "react";

/**
 * IntersectionObserver 기반 스크롤 진입 애니메이션 훅
 * 반환된 ref를 요소에 붙이면, 해당 요소가 뷰포트에 진입할 때
 * `scroll-reveal--visible` 클래스가 추가됩니다.
 *
 * 요소에 `className="scroll-reveal scroll-reveal--d1"` 처럼
 * 딜레이 클래스를 함께 사용하세요.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.12
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 이미 visible이면 아무것도 안 함
    if (el.classList.contains("scroll-reveal--visible")) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("scroll-reveal--visible");
          obs.unobserve(el);
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}
