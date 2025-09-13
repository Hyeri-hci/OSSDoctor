package com.ossdoctor.config;

import com.ossdoctor.DTO.BadgeDTO;
import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Service.BadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeDataInitializer implements CommandLineRunner {

    private final BadgeService badgeService;

    @Override
    public void run(String... args) throws Exception {
        List<BadgeDTO> badges = List.of(
                BadgeDTO.builder().name("Initiator").description("첫 커밋을 시작했습니다").category(BADGE_CATEGORY.COMMIT).level(1).requirement("첫 커밋, 20/50/100/200회").build(),
                BadgeDTO.builder().name("Routine Loader").description("꾸준한 커밋 활동을 보여줍니다").category(BADGE_CATEGORY.COMMIT).level(2).requirement("첫 커밋, 20/50/100/200회").build(),
                BadgeDTO.builder().name("Backbone Coder").description("프로젝트의 핵심 개발자입니다").category(BADGE_CATEGORY.COMMIT).level(3).requirement("첫 커밋, 20/50/100/200회").build(),
                BadgeDTO.builder().name("Mainline Pulse").description("프로젝트의 메인 동력원입니다").category(BADGE_CATEGORY.COMMIT).level(4).requirement("첫 커밋, 20/50/100/200회").build(),

                BadgeDTO.builder().name("Daily Spark").description("매일 커밋하는 습관을 만들었습니다").category(BADGE_CATEGORY.COMMIT_STREAK).level(1).requirement("3/7/14/30일 연속 커밋").build(),
                BadgeDTO.builder().name("Habitualist").description("일주일 연속 커밋을 달성했습니다").category(BADGE_CATEGORY.COMMIT_STREAK).level(2).requirement("3/7/14/30일 연속 커밋").build(),
                BadgeDTO.builder().name("Consistency Engineer").description("2주 연속 커밋의 일관성을 보여줍니다").category(BADGE_CATEGORY.COMMIT_STREAK).level(3).requirement("3/7/14/30일 연속 커밋").build(),
                BadgeDTO.builder().name("Unbroken Chain").description("한 달 연속 커밋의 끊이지 않는 체인").category(BADGE_CATEGORY.COMMIT_STREAK).level(4).requirement("3/7/14/30일 연속 커밋").build(),

                BadgeDTO.builder().name("Door Opener").description("첫 번째 PR을 열었습니다").category(BADGE_CATEGORY.PR_EXTERNAL).level(1).requirement("첫 PR, 5/10/30/50회").build(),
                BadgeDTO.builder().name("Merge Navigator").description("여러 PR을 성공적으로 병합했습니다").category(BADGE_CATEGORY.PR_EXTERNAL).level(2).requirement("첫 PR, 5/10/30/50회").build(),
                BadgeDTO.builder().name("Collaboration Director").description("협업의 방향을 제시하는 리더입니다").category(BADGE_CATEGORY.PR_EXTERNAL).level(3).requirement("첫 PR, 5/10/30/50회").build(),
                BadgeDTO.builder().name("Network Weaver").description("오픈소스 네트워크를 엮어가는 전문가").category(BADGE_CATEGORY.PR_EXTERNAL).level(4).requirement("첫 PR, 5/10/30/50회").build(),

                BadgeDTO.builder().name("Integration Pioneer").description("첫 번째 PR 병합을 달성했습니다").category(BADGE_CATEGORY.PR_MERGE).level(1).requirement("첫/5/10/20회 merge").build(),
                BadgeDTO.builder().name("Fusion Operator").description("여러 기능을 융합하는 전문가").category(BADGE_CATEGORY.PR_MERGE).level(2).requirement("첫/5/10/20회 merge").build(),
                BadgeDTO.builder().name("Release Catalyst").description("릴리즈의 촉매 역할을 합니다").category(BADGE_CATEGORY.PR_MERGE).level(3).requirement("첫/5/10/20회 merge").build(),
                BadgeDTO.builder().name("Harmony Maker").description("프로젝트에 조화를 만들어내는 마스터").category(BADGE_CATEGORY.PR_MERGE).level(4).requirement("첫/5/10/20회 merge").build(),

                BadgeDTO.builder().name("Signal Sender").description("첫 번째 이슈를 등록했습니다").category(BADGE_CATEGORY.ISSUE_CREATE).level(1).requirement("첫/5/10/30회 이슈 등록").build(),
                BadgeDTO.builder().name("Bug Radar").description("버그를 찾아내는 레이더같은 능력").category(BADGE_CATEGORY.ISSUE_CREATE).level(2).requirement("첫/5/10/30회 이슈 등록").build(),
                BadgeDTO.builder().name("Problem Mapper").description("문제를 체계적으로 매핑하는 전문가").category(BADGE_CATEGORY.ISSUE_CREATE).level(3).requirement("첫/5/10/30회 이슈 등록").build(),
                BadgeDTO.builder().name("Solutions Syndicator").description("해결책을 조합하는 신디케이터").category(BADGE_CATEGORY.ISSUE_CREATE).level(4).requirement("첫/5/10/30회 이슈 등록").build(),

                BadgeDTO.builder().name("Debug Trigger").description("첫 번째 이슈를 해결했습니다").category(BADGE_CATEGORY.ISSUE_SOLVE).level(1).requirement("첫/5/10/30회 이슈 close").build(),
                BadgeDTO.builder().name("Resolution Agent").description("이슈 해결의 전문 에이전트").category(BADGE_CATEGORY.ISSUE_SOLVE).level(2).requirement("첫/5/10/30회 이슈 close").build(),
                BadgeDTO.builder().name("Code Medic").description("코드의 의사, 문제를 치료합니다").category(BADGE_CATEGORY.ISSUE_SOLVE).level(3).requirement("첫/5/10/30회 이슈 close").build(),
                BadgeDTO.builder().name("Stability Guru").description("안정성의 구루, 모든 문제를 해결").category(BADGE_CATEGORY.ISSUE_SOLVE).level(4).requirement("첫/5/10/30회 이슈 close").build(),

                BadgeDTO.builder().name("Gatekeeper").description("첫 번째 코드 리뷰를 완료했습니다").category(BADGE_CATEGORY.CODE_REVIEW).level(1).requirement("첫/5/10/30회 리뷰 참여").build(),
                BadgeDTO.builder().name("Integrity Auditor").description("코드 무결성을 감사하는 전문가").category(BADGE_CATEGORY.CODE_REVIEW).level(2).requirement("첫/5/10/30회 리뷰 참여").build(),
                BadgeDTO.builder().name("Quality Whisperer").description("품질의 속삭임을 듣는 전문가").category(BADGE_CATEGORY.CODE_REVIEW).level(3).requirement("첫/5/10/30회 리뷰 참여").build(),
                BadgeDTO.builder().name("Code Oracle").description("코드의 오라클, 모든 것을 꿰뚫어 봅니다").category(BADGE_CATEGORY.CODE_REVIEW).level(4).requirement("첫/5/10/30회 리뷰 참여").build(),

                BadgeDTO.builder().name("Spotlight Effect").description("10개 프로젝트에 스타를 주었습니다").category(BADGE_CATEGORY.STAR).level(1).requirement("10/30/50/100개 별표").build(),
                BadgeDTO.builder().name("Popularity Gainer").description("인기 프로젝트를 발굴하는 안목").category(BADGE_CATEGORY.STAR).level(2).requirement("10/30/50/100개 별표").build(),
                BadgeDTO.builder().name("Star Magnet").description("별을 끌어모으는 자석같은 매력").category(BADGE_CATEGORY.STAR).level(3).requirement("10/30/50/100개 별표").build(),
                BadgeDTO.builder().name("Community Beacon").description("커뮤니티의 등대 역할을 합니다").category(BADGE_CATEGORY.STAR).level(4).requirement("10/30/50/100개 별표").build(),

                BadgeDTO.builder().name("Branch Divergent").description("5개 프로젝트를 포크했습니다").category(BADGE_CATEGORY.FORK).level(1).requirement("5/10/20/50개 포크").build(),
                BadgeDTO.builder().name("Fork Explorer").description("포크의 탐험가, 새로운 길을 개척").category(BADGE_CATEGORY.FORK).level(2).requirement("5/10/20/50개 포크").build(),
                BadgeDTO.builder().name("Source Cultivator").description("소스코드를 기르는 재배자").category(BADGE_CATEGORY.FORK).level(3).requirement("5/10/20/50개 포크").build(),
                BadgeDTO.builder().name("Ecosystem Builder").description("생태계를 구축하는 건축가").category(BADGE_CATEGORY.FORK).level(4).requirement("5/10/20/50개 포크").build(),

                BadgeDTO.builder().name("Watchtower").description("5개 프로젝트를 관찰하고 있습니다").category(BADGE_CATEGORY.WATCH).level(1).requirement("5/10/20/50개 watch").build(),
                BadgeDTO.builder().name("Watchful Neighbor").description("이웃 프로젝트를 살피는 관찰자").category(BADGE_CATEGORY.WATCH).level(2).requirement("5/10/20/50개 watch").build(),
                BadgeDTO.builder().name("Pulse Guardian").description("프로젝트 맥박을 지키는 수호자").category(BADGE_CATEGORY.WATCH).level(3).requirement("5/10/20/50개 watch").build(),
                BadgeDTO.builder().name("Sentinel of Trends").description("트렌드의 파수꾼").category(BADGE_CATEGORY.WATCH).level(4).requirement("5/10/20/50개 watch").build(),

                BadgeDTO.builder().name("Upcycle Explorer").description("업사이클링 프로젝트에 첫 참여").category(BADGE_CATEGORY.UPCYCLE).level(1).requirement("업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30").build(),
                BadgeDTO.builder().name("Revival Contributor").description("프로젝트 부활에 기여하는 공헌자").category(BADGE_CATEGORY.UPCYCLE).level(2).requirement("업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30").build(),
                BadgeDTO.builder().name("Sustainability Builder").description("지속가능성을 구축하는 빌더").category(BADGE_CATEGORY.UPCYCLE).level(3).requirement("업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30").build(),
                BadgeDTO.builder().name("Legacy Reviver").description("레거시를 되살리는 부활의 마스터").category(BADGE_CATEGORY.UPCYCLE).level(4).requirement("업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30").build()
        );

        badges.forEach(badge -> {
            if (!badgeService.existsByName(badge.getName())) {
                badgeService.save(badge);
            }
        });

        log.info("Badge data initialized via DTO.");
    }
}
