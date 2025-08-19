export const baseProjectData = {
    name: "react",
    fullName: "facebook/react",
    description: "The library for web and native user interfaces",
    language: "JavaScript",
    stargazersCount: 228000,
    forksCount: 46800,
    size: 15420,
    createdAt: "2013-05-24T16:15:54Z",
    updatedAt: "2024-01-15T10:30:45Z",
    pushedAt: "2024-01-15T09:45:30Z",
    commits: {
        total: 16500,
        lastCommitDate: "2024-01-15"
    },
    pullRequests: {
        open: 145,
        closed: 12800,
        total: 12945
    },
    issues: {
        open: 890,
        closed: 18500,
        total: 19390
    },
    contributors: [
        {
            login: "gaearon",
            contributions: 2850,
            avatar_url: "https://avatars.githubusercontent.com/u/810438?v=4"
        },
        {
            login: "acdlite",
            contributions: 1920,
            avatar_url: "https://avatars.githubusercontent.com/u/3624098?v=4"
        },
        {
            login: "sebmarkbage",
            contributions: 1680,
            avatar_url: "https://avatars.githubusercontent.com/u/63648?v=4"
        },
        {
            login: "rickhanlonii",
            contributions: 1250,
            avatar_url: "https://avatars.githubusercontent.com/u/2440089?v=4"
        },
        {
            login: "sophiebits",
            contributions: 980,
            avatar_url: "https://avatars.githubusercontent.com/u/6820?v=4"
        }
    ],
    languages: {
        "JavaScript": 85.2,
        "TypeScript": 8.9,
        "HTML": 3.1,
        "CSS": 1.8,
        "Other": 1.0
    }
};


export const healthExtensions = {
    pullRequests: {
        ...baseProjectData.pullRequests,
        merged: 11200
    },

    // 커밋 활동 데이터 (최근 30일)
    commitActivity: [
        { date: "2024-01-15", commits: 18, day: "월" },
        { date: "2024-01-14", commits: 4, day: "일" },
        { date: "2024-01-13", commits: 20, day: "토" },
        { date: "2024-01-12", commits: 6, day: "금" },
        { date: "2024-01-11", commits: 15, day: "목" },
        { date: "2024-01-10", commits: 8, day: "수" },
        { date: "2024-01-09", commits: 12, day: "화" },
        { date: "2024-01-08", commits: 22, day: "월" },
        { date: "2024-01-07", commits: 9, day: "일" },
        { date: "2024-01-06", commits: 14, day: "토" },
        { date: "2024-01-05", commits: 25, day: "금" },
        { date: "2024-01-04", commits: 11, day: "목" },
        { date: "2024-01-03", commits: 7, day: "수" },
        { date: "2024-01-02", commits: 16, day: "화" },
        { date: "2024-01-01", commits: 3, day: "월" },
        { date: "2023-12-31", commits: 8, day: "일" },
        { date: "2023-12-30", commits: 19, day: "토" },
        { date: "2023-12-29", commits: 13, day: "금" },
        { date: "2023-12-28", commits: 21, day: "목" },
        { date: "2023-12-27", commits: 6, day: "수" },
        { date: "2023-12-26", commits: 10, day: "화" },
        { date: "2023-12-25", commits: 2, day: "월" },
        { date: "2023-12-24", commits: 5, day: "일" },
        { date: "2023-12-23", commits: 17, day: "토" },
        { date: "2023-12-22", commits: 23, day: "금" },
        { date: "2023-12-21", commits: 12, day: "목" },
        { date: "2023-12-20", commits: 15, day: "수" },
        { date: "2023-12-19", commits: 9, day: "화" },
        { date: "2023-12-18", commits: 18, day: "월" },
        { date: "2023-12-17", commits: 7, day: "일" }
    ],
    recentActivities: [
        {
            date: "2024년 1월 15일",
            activities: [
                {
                    type: "commit",
                    title: "Fix memory leak in useEffect cleanup",
                    author: "gaearon",
                    time: "14:30"
                },
                {
                    type: "pr_merged",
                    title: "Add TypeScript support for new hooks",
                    author: "acdlite",
                    time: "11:20"
                },
                {
                    type: "issue_opened",
                    title: "Improve error handling in Suspense boundaries",
                    author: "sebmarkbage",
                    time: "09:15"
                }
            ]
        },
        {
            date: "2024년 1월 14일",
            activities: [
                {
                    type: "issue_closed",
                    title: "Performance optimization for large lists",
                    author: "sebmarkbage",
                    time: "16:45"
                },
                {
                    type: "pr_opened",
                    title: "Implement new context API",
                    author: "rickhanlonii",
                    time: "09:15"
                },
                {
                    type: "commit",
                    title: "Update dependencies to latest versions",
                    author: "sophiebits",
                    time: "13:22"
                },
                {
                    type: "pr_merged",
                    title: "Fix SSR hydration mismatch warnings",
                    author: "gaearon",
                    time: "10:50"
                }
            ]
        },
        {
            date: "2024년 1월 13일",
            activities: [
                {
                    type: "commit",
                    title: "Refactor concurrent features implementation",
                    author: "acdlite",
                    time: "15:30"
                },
                {
                    type: "issue_closed",
                    title: "Memory leak in development mode",
                    author: "rickhanlonii",
                    time: "14:20"
                },
                {
                    type: "pr_opened",
                    title: "Add new useId hook for accessibility",
                    author: "sebmarkbage",
                    time: "11:45"
                },
                {
                    type: "commit",
                    title: "Improve TypeScript definitions for React.memo",
                    author: "sophiebits",
                    time: "09:30"
                },
                {
                    type: "pr_merged",
                    title: "Optimize bundle size for production builds",
                    author: "gaearon",
                    time: "08:15"
                }
            ]
        },
        {
            date: "2024년 1월 12일",
            activities: [
                {
                    type: "issue_opened",
                    title: "React 18 compatibility issues with third-party libraries",
                    author: "acdlite",
                    time: "17:10"
                },
                {
                    type: "commit",
                    title: "Add comprehensive test coverage for new features",
                    author: "rickhanlonii",
                    time: "16:25"
                },
                {
                    type: "pr_merged",
                    title: "Implement automatic batching improvements",
                    author: "sebmarkbage",
                    time: "14:40"
                }
            ]
        },
        {
            date: "2024년 1월 11일",
            activities: [
                {
                    type: "commit",
                    title: "Fix edge case in useEffect cleanup timing",
                    author: "gaearon",
                    time: "18:45"
                },
                {
                    type: "issue_closed",
                    title: "Improve error messages for invalid prop types",
                    author: "sophiebits",
                    time: "16:30"
                },
                {
                    type: "pr_opened",
                    title: "Add support for React DevTools Profiler API",
                    author: "acdlite",
                    time: "15:20"
                },
                {
                    type: "commit",
                    title: "Optimize re-rendering performance in development",
                    author: "rickhanlonii",
                    time: "12:15"
                },
                {
                    type: "pr_merged",
                    title: "Update documentation for new concurrent features",
                    author: "sebmarkbage",
                    time: "10:05"
                }
            ]
        },
        {
            date: "2024년 1월 10일",
            activities: [
                {
                    type: "issue_opened",
                    title: "Investigate performance regression in list rendering",
                    author: "gaearon",
                    time: "19:20"
                },
                {
                    type: "commit",
                    title: "Implement new reconciler optimizations",
                    author: "sebmarkbage",
                    time: "17:30"
                },
                {
                    type: "pr_merged",
                    title: "Fix memory leaks in strict mode",
                    author: "acdlite",
                    time: "15:45"
                },
                {
                    type: "issue_closed",
                    title: "Improve accessibility of focus management",
                    author: "sophiebits",
                    time: "13:10"
                }
            ]
        },
        {
            date: "2024년 1월 9일",
            activities: [
                {
                    type: "commit",
                    title: "Add new experimental features flag system",
                    author: "rickhanlonii",
                    time: "16:55"
                },
                {
                    type: "pr_opened",
                    title: "Implement improved error boundaries",
                    author: "gaearon",
                    time: "14:30"
                },
                {
                    type: "issue_closed",
                    title: "Fix hydration issues with Suspense",
                    author: "sebmarkbage",
                    time: "12:20"
                },
                {
                    type: "commit",
                    title: "Optimize development tools integration",
                    author: "acdlite",
                    time: "11:15"
                }
            ]
        },
        {
            date: "2024년 1월 8일",
            activities: [
                {
                    type: "pr_merged",
                    title: "Add support for React Server Components",
                    author: "sebmarkbage",
                    time: "18:00"
                },
                {
                    type: "issue_opened",
                    title: "Investigate bundle size increase in latest build",
                    author: "sophiebits",
                    time: "16:40"
                },
                {
                    type: "commit",
                    title: "Improve performance monitoring capabilities",
                    author: "rickhanlonii",
                    time: "15:25"
                },
                {
                    type: "pr_opened",
                    title: "Update build system for better tree-shaking",
                    author: "gaearon",
                    time: "13:50"
                }
            ]
        }
    ]
};


export const mockSecurityData = [
    {
        id: 'CVE-2024-6387',
        title: 'OpenSSH regreSSHion vulnerability',
        severity: 'High',
        cvss: '8.1',
        status: 'patched',
        date: '2024-07-01',
        description: 'A signal handler race condition in OpenSSH\'s server (sshd) allows unauthenticated remote code execution as root on glibc-based Linux systems.',
        versions: ['9.2p1', '9.1p1', '9.0p1'],
        technicalDetails: `The vulnerability exists in the signal handler for SIGALRM in OpenSSH server daemon.
When a client fails to authenticate within the LoginGraceTime period, sshd calls a signal handler
that can be exploited to achieve remote code execution as root.`,
        mitigation: 'Update to OpenSSH version 9.8 or later. Set LoginGraceTime to 0 to disable timeout-based authentication.'
    },
    {
        id: 'CVE-2024-3094',
        title: 'XZ Utils backdoor supply chain attack',
        severity: 'Critical',
        cvss: '10.0',
        status: 'mitigated',
        date: '2024-03-29',
        description: 'Malicious code was inserted into the liblzma library via the XZ Utils package, affecting SSH authentication in some Linux distributions.',
        versions: ['5.6.0', '5.6.1'],
        technicalDetails: `The backdoor was inserted through a sophisticated supply chain attack where
malicious test files contained compressed payloads that were extracted and executed during the build process.
The backdoor specifically targeted SSH authentication mechanisms.`,
        mitigation: 'Downgrade to XZ Utils version 5.4.x or earlier. Most Linux distributions have released patches.'
    },
    {
        id: 'CVE-2024-2879',
        title: 'Node.js HTTP/2 server DoS vulnerability',
        severity: 'High',
        cvss: '7.5',
        status: 'patched',
        date: '2024-06-15',
        description: 'A vulnerability in Node.js HTTP/2 server implementation allows remote attackers to cause denial of service through malformed headers.',
        versions: ['20.x < 20.14.0', '18.x < 18.20.3'],
        technicalDetails: `The vulnerability occurs when processing HTTP/2 headers with specific malformed content,
causing the server to consume excessive memory and eventually crash.`,
        mitigation: 'Update to Node.js 20.14.0, 18.20.3, or later versions.'
    },
    {
        id: 'CVE-2024-1741',
        title: 'React DOM XSS vulnerability in development mode',
        severity: 'Medium',
        cvss: '6.1',
        status: 'fixed',
        date: '2024-05-20',
        description: 'A cross-site scripting (XSS) vulnerability in React DOM development mode allows injection of malicious scripts.',
        versions: ['18.0.0 to 18.2.0'],
        technicalDetails: `In development mode, React DOM does not properly sanitize certain props before rendering,
allowing attackers to inject malicious scripts through crafted component properties.`,
        mitigation: 'Update to React 18.3.0 or later. Ensure production builds are used in production environments.'
    },
    {
        id: 'CVE-2023-50387',
        title: 'FortiGate SSL VPN buffer overflow',
        severity: 'High',
        cvss: '9.8',
        status: 'patched',
        date: '2023-12-11',
        description: 'A heap-based buffer overflow vulnerability in FortiOS SSL VPN may allow a remote unauthenticated attacker to execute arbitrary code.',
        versions: ['7.4.0 to 7.4.2', '7.2.0 to 7.2.6', '7.0.0 to 7.0.13', '6.4 all versions'],
        technicalDetails: `The vulnerability is in the SSL VPN web portal component where malformed HTTP requests
can cause a buffer overflow in heap memory, potentially allowing remote code execution.`,
        mitigation: 'Update to FortiOS 7.4.3, 7.2.7, 7.0.14, or 6.4.15 and later versions.'
    },
    {
        id: 'CVE-2023-44487',
        title: 'HTTP/2 Rapid Reset attack',
        severity: 'High',
        cvss: '7.5',
        status: 'patched',
        date: '2023-10-10',
        description: 'The HTTP/2 protocol allows a denial of service (server resource consumption) because request cancellation can reset many streams quickly.',
        versions: ['HTTP/2 implementations'],
        technicalDetails: `Attackers can exploit this by rapidly creating and canceling HTTP/2 streams,
causing servers to allocate resources for each stream without properly cleaning them up when canceled.`,
        mitigation: 'Update HTTP/2 implementations to include rate limiting and proper stream cleanup mechanisms.'
    },
    {
        id: 'CVE-2023-4911',
        title: 'GNU C Library buffer overflow (Looney Tunables)',
        severity: 'High',
        cvss: '7.8',
        status: 'patched',
        date: '2023-10-03',
        description: 'A buffer overflow vulnerability in GNU C Library\'s ld.so dynamic loader may allow local privilege escalation.',
        versions: ['glibc 2.34 to 2.38'],
        technicalDetails: `The vulnerability is in the GLIBC_TUNABLES environment variable processing,
where specially crafted values can cause a buffer overflow in the dynamic loader.`,
        mitigation: 'Update to glibc 2.39 or apply vendor patches. Disable GLIBC_TUNABLES if not needed.'
    },
    {
        id: 'CVE-2023-38545',
        title: 'curl SOCKS5 heap buffer overflow',
        severity: 'High',
        cvss: '9.8',
        status: 'fixed',
        date: '2023-10-11',
        description: 'A heap buffer overflow vulnerability in curl when using SOCKS5 proxy with very long hostnames.',
        versions: ['7.69.0 to 8.3.0'],
        technicalDetails: `When curl is told to use a SOCKS5 proxy and the hostname is provided as part of the URL,
curl copies the hostname to a fixed-size buffer without proper bounds checking.`,
        mitigation: 'Update to curl 8.4.0 or later. Avoid using very long hostnames with SOCKS5 proxies.'
    },
    {
        id: 'CVE-2023-36664',
        title: 'Ghostscript remote code execution',
        severity: 'Critical',
        cvss: '9.8',
        status: 'patched',
        date: '2023-07-04',
        description: 'Ghostscript contains a remote code execution vulnerability when processing crafted PostScript documents.',
        versions: ['10.01.0 and earlier'],
        technicalDetails: `The vulnerability exists in the PostScript interpreter where malicious documents
can execute arbitrary code by exploiting unsafe operations in the graphics library.`,
        mitigation: 'Update to Ghostscript 10.01.1 or later. Validate and sanitize all PostScript inputs.'
    },
    {
        id: 'CVE-2023-28772',
        title: 'Webpack dev server path traversal',
        severity: 'Medium',
        cvss: '5.3',
        status: 'fixed',
        date: '2023-06-20',
        description: 'A path traversal vulnerability in Webpack dev server allows access to files outside the intended directory.',
        versions: ['4.0.0 to 4.15.0'],
        technicalDetails: `The vulnerability occurs in the static file serving functionality where
specially crafted URLs can bypass path restrictions and access arbitrary files.`,
        mitigation: 'Update to webpack-dev-server 4.15.1 or later. Use proper access controls in production.'
    },
    {
        id: 'CVE-2023-26136',
        title: 'tough-cookie prototype pollution',
        severity: 'Medium',
        cvss: '6.5',
        status: 'fixed',
        date: '2023-05-15',
        description: 'The tough-cookie package is vulnerable to prototype pollution when parsing malicious cookies.',
        versions: ['4.0.0 to 4.1.2'],
        technicalDetails: `When parsing cookies with specially crafted names or values,
the library can modify Object.prototype properties, leading to potential security issues.`,
        mitigation: 'Update to tough-cookie 4.1.3 or later. Validate cookie inputs thoroughly.'
    },
    {
        id: 'CVE-2023-26115',
        title: 'word-wrap ReDoS vulnerability',
        severity: 'High',
        cvss: '7.5',
        status: 'fixed',
        date: '2023-04-28',
        description: 'The word-wrap package is vulnerable to Regular Expression Denial of Service (ReDoS) attacks.',
        versions: ['1.0.0 to 1.2.3'],
        technicalDetails: `The vulnerability exists in the regular expression used for word wrapping,
which can be exploited with crafted input to cause excessive CPU consumption.`,
        mitigation: 'Update to word-wrap 1.2.4 or later. Implement input validation for text processing.'
    },
    {
        id: 'CVE-2023-25653',
        title: 'TensorFlow null pointer dereference',
        severity: 'Medium',
        cvss: '6.5',
        status: 'patched',
        date: '2023-03-25',
        description: 'TensorFlow contains a null pointer dereference vulnerability in the AvgPool3DGrad operator.',
        versions: ['2.11.0 to 2.11.1', '2.12.0'],
        technicalDetails: `The vulnerability occurs when the AvgPool3DGrad operator processes malformed input tensors,
leading to a null pointer dereference and potential denial of service.`,
        mitigation: 'Update to TensorFlow 2.11.2, 2.12.1, or later. Validate tensor inputs before processing.'
    },
    {
        id: 'CVE-2023-24329',
        title: 'Python urllib.parse URL parsing bypass',
        severity: 'High',
        cvss: '7.5',
        status: 'fixed',
        date: '2023-02-17',
        description: 'An issue in urllib.parse allows attackers to bypass hostname checking by prepending URLs with whitespace.',
        versions: ['3.11.0 to 3.11.1', '3.10.0 to 3.10.9'],
        technicalDetails: `The vulnerability allows bypassing URL validation by using URLs that start with whitespace characters,
which are not properly handled by the parsing logic.`,
        mitigation: 'Update to Python 3.11.2, 3.10.10, or later. Implement additional URL validation.'
    },
    {
        id: 'CVE-2023-22809',
        title: 'Sudo privilege escalation',
        severity: 'High',
        cvss: '7.8',
        status: 'patched',
        date: '2023-01-18',
        description: 'A privilege escalation vulnerability in sudo allows local users to gain root access.',
        versions: ['1.8.0 to 1.9.12p1'],
        technicalDetails: `The vulnerability exists in the sudoedit functionality where specially crafted symbolic links
can be used to edit arbitrary files with root privileges.`,
        mitigation: 'Update to sudo 1.9.12p2 or later. Review and restrict sudoedit configurations.'
    },
    {
        id: 'CVE-2022-48174',
        title: 'Busybox awk heap overflow',
        severity: 'High',
        cvss: '8.8',
        status: 'fixed',
        date: '2022-12-05',
        description: 'A heap buffer overflow in BusyBox awk command when processing large input files.',
        versions: ['1.35.0 and earlier'],
        technicalDetails: `The vulnerability occurs in the awk implementation when processing files with very long lines,
causing a heap buffer overflow that can lead to arbitrary code execution.`,
        mitigation: 'Update to BusyBox 1.36.0 or later. Validate input file sizes and content.'
    }
];

export const mockProjectInfoData = {
    name: "react-awesome-project",
    description: "A modern React application with TypeScript, Tailwind CSS, and comprehensive testing suite. This project demonstrates best practices in frontend development including component architecture, state management, and responsive design patterns.",
    owner: {
        name: "awesome-developer",
        avatar: "https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=AD"
    },
    stats: {
        stars: 1247,
        forks: 234,
        watchers: 89
    },
    language: "TypeScript",
    license: "MIT",
    lastPush: "2024-01-15",
    topics: ["react", "typescript", "tailwind", "vite"]
};


export const getMockProjectData = () => baseProjectData;

export const getMockHealthData = () => ({
    ...baseProjectData,
    ...healthExtensions
});

export const getMockSecurityData = () => mockSecurityData;

export const getMockProjectInfoData = () => mockProjectInfoData;
