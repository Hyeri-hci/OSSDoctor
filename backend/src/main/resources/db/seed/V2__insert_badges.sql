INSERT INTO badge (name, description, category, level, requirement) VALUES
('Initiator','첫 커밋을 시작했습니다','COMMIT',1,'첫 커밋, 20/50/100회'),
('Routine Loader','꾸준한 커밋 활동을 보여줍니다','COMMIT',2,'첫 커밋, 20/50/100회'),
('Backbone Coder','프로젝트의 핵심 개발자입니다','COMMIT',3,'첫 커밋, 20/50/100회'),
('Mainline Pulse','프로젝트의 메인 동력원입니다','COMMIT',4,'첫 커밋, 20/50/100회'),

('Daily Spark','매일 커밋하는 습관을 만들었습니다','COMMIT_STREAK',1,'3/7/14/30일 연속 커밋'),
('Habitualist','일주일 연속 커밋을 달성했습니다','COMMIT_STREAK',2,'3/7/14/30일 연속 커밋'),
('Consistency Engineer','2주 연속 커밋의 일관성을 보여줍니다','COMMIT_STREAK',3,'3/7/14/30일 연속 커밋'),
('Unbroken Chain','한 달 연속 커밋의 끊이지 않는 체인','COMMIT_STREAK',4,'3/7/14/30일 연속 커밋'),

('Door Opener','첫 번째 PR을 열었습니다','PR_EXTERNAL',1,'첫 PR, 5/10/30회'),
('Merge Navigator','여러 PR을 성공적으로 병합했습니다','PR_EXTERNAL',2,'첫 PR, 5/10/30회'),
('Collaboration Director','협업의 방향을 제시하는 리더입니다','PR_EXTERNAL',3,'첫 PR, 5/10/30회'),
('Network Weaver','오픈소스 네트워크를 엮어가는 전문가','PR_EXTERNAL',4,'첫 PR, 5/10/30회'),

('Integration Pioneer','첫 번째 PR 병합을 달성했습니다','PR_MERGE',1,'첫/5/10/20회 merge'),
('Fusion Operator','여러 기능을 융합하는 전문가','PR_MERGE',2,'첫/5/10/20회 merge'),
('Release Catalyst','릴리즈의 촉매 역할을 합니다','PR_MERGE',3,'첫/5/10/20회 merge'),
('Harmony Maker','프로젝트에 조화를 만들어내는 마스터','PR_MERGE',4,'첫/5/10/20회 merge'),

('Signal Sender','첫 번째 이슈를 등록했습니다','ISSUE_CREATE',1,'첫/5/10/30회 이슈 등록'),
('Bug Radar','버그를 찾아내는 레이더같은 능력','ISSUE_CREATE',2,'첫/5/10/30회 이슈 등록'),
('Problem Mapper','문제를 체계적으로 매핑하는 전문가','ISSUE_CREATE',3,'첫/5/10/30회 이슈 등록'),
('Solutions Syndicator','해결책을 조합하는 신디케이터','ISSUE_CREATE',4,'첫/5/10/30회 이슈 등록'),

('Debug Trigger','첫 번째 이슈를 해결했습니다','ISSUE_SOLVE',1,'첫/5/10/30회 이슈 close'),
('Resolution Agent','이슈 해결의 전문 에이전트','ISSUE_SOLVE',2,'첫/5/10/30회 이슈 close'),
('Code Medic','코드의 의사, 문제를 치료합니다','ISSUE_SOLVE',3,'첫/5/10/30회 이슈 close'),
('Stability Guru','안정성의 구루, 모든 문제를 해결','ISSUE_SOLVE',4,'첫/5/10/30회 이슈 close'),

('Gatekeeper','첫 번째 코드 리뷰를 완료했습니다','CODE_REVIEW',1,'첫/5/10/30회 리뷰 참여'),
('Integrity Auditor','코드 무결성을 감사하는 전문가','CODE_REVIEW',2,'첫/5/10/30회 리뷰 참여'),
('Quality Whisperer','품질의 속삭임을 듣는 전문가','CODE_REVIEW',3,'첫/5/10/30회 리뷰 참여'),
('Code Oracle','코드의 오라클, 모든 것을 꿰뚫어 봅니다','CODE_REVIEW',4,'첫/5/10/30회 리뷰 참여'),

('Spotlight Effect','10개 프로젝트에 스타를 주었습니다','STAR',1,'10/30/50/100개 별표'),
('Popularity Gainer','인기 프로젝트를 발굴하는 안목','STAR',2,'10/30/50/100개 별표'),
('Star Magnet','별을 끌어모으는 자석같은 매력','STAR',3,'10/30/50/100개 별표'),
('Community Beacon','커뮤니티의 등대 역할을 합니다','STAR',4,'10/30/50/100개 별표'),

('Branch Divergent','5개 프로젝트를 포크했습니다','FORK',1,'5/10/20/50개 포크'),
('Fork Explorer','포크의 탐험가, 새로운 길을 개척','FORK',2,'5/10/20/50개 포크'),
('Source Cultivator','소스코드를 기르는 재배자','FORK',3,'5/10/20/50개 포크'),
('Ecosystem Builder','생태계를 구축하는 건축가','FORK',4,'5/10/20/50개 포크'),

('Watchtower','5개 프로젝트를 관찰하고 있습니다','WATCH',1,'5/10/20/50개 watch'),
('Watchful Neighbor','이웃 프로젝트를 살피는 관찰자','WATCH',2,'5/10/20/50개 watch'),
('Pulse Guardian','프로젝트 맥박을 지키는 수호자','WATCH',3,'5/10/20/50개 watch'),
('Sentinel of Trends','트렌드의 파수꾼','WATCH',4,'5/10/20/50개 watch')
ON DUPLICATE KEY UPDATE name = name;
