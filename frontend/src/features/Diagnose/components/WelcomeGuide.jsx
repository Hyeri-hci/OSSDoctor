import React from 'react';
import { MagnifyingGlassIcon, DocumentMagnifyingGlassIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const WelcomeGuide = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    GitHub 레포지토리 진단하기
                </h2>
                <p className="text-gray-600">
                    오픈소스 프로젝트의 건강성과 보안성을 종합적으로 분석해드립니다
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MagnifyingGlassIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">프로젝트 분석</h3>
                    <p className="text-sm text-gray-600">
                        활성도, 커뮤니티, 인기도 등 프로젝트의 전반적인 상태를 분석합니다
                    </p>
                </div>

                <div className="text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ShieldCheckIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">보안 검사</h3>
                    <p className="text-sm text-gray-600">
                        알려진 취약점과 보안 이슈를 확인하여 안전성을 평가합니다
                    </p>
                </div>

                <div className="text-center md:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">상세 리포트</h3>
                    <p className="text-sm text-gray-600">
                        점수와 함께 구체적인 개선 방안을 제시해드립니다
                    </p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">시작하는 방법</h4>
                <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">1</span>
                        <span>위의 검색창에 GitHub 레포지토리 주소를 입력하세요</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">2</span>
                        <span>예시: <code className="bg-white px-2 py-1 rounded text-xs">microsoft/vscode</code> 또는 <code className="bg-white px-2 py-1 rounded text-xs">https://github.com/microsoft/vscode</code></span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">3</span>
                        <span>진단 시작 버튼을 클릭하면 종합적인 분석 결과를 확인할 수 있습니다</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeGuide;
