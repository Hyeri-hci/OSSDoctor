import React, { useState } from 'react';
import { Layout } from '../../../components/layout';
import ProjectInfo from '../components/ProjectInfo';
import DiagnoseSearchSection from '../components/DiagnoseSearchSection';
import DiagnoseTabContent from '../components/DiagnoseTabContent';
import { ScoreCards } from '../../../components/common';

const Diagnose = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Header */}
                <DiagnoseSearchSection onSearch={() => { }} error={null} />

                {/* Main */}
                <div className="bg-white">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-6">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <ProjectInfo />
                            <ScoreCards scores={{}} activeTab={activeTab} onTabChange={setActiveTab} variant='diagnose' />
                            <DiagnoseTabContent activeTab={activeTab} loading={false} projectData={null} fullProjectName={''} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Diagnose;