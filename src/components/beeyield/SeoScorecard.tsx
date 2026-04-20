import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Info, Search, Mic, Globe, BarChart } from 'lucide-react';
import { SEOScoreResult } from '@/services/contentEngineService';

interface SeoScorecardProps {
    analysis: SEOScoreResult;
    focusKeywords: string[];
}

const ScoreRing = ({ score, color, label, icon: Icon }: { score: number, color: string, label: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center p-2 text-center">
        <div className="relative flex items-center justify-center w-16 h-16 mb-2">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-muted/20"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke={color}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={175.93}
                    strokeDashoffset={175.93 - (175.93 * score) / 100}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {score}
            </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Icon className="w-3 h-3" />
            {label}
        </div>
    </div>
);

const IssueList = ({ issues, passes }: { issues: string[], passes: string[] }) => (
    <ScrollArea className="h-[300px] w-full pr-4">
        <div className="space-y-4">
            {issues.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        Improvements Needed ({issues.length})
                    </h4>
                    <ul className="space-y-2">
                        {issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1 text-xs">•</span>
                                <span>{issue.replace('⚠️ ', '')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {passes.length > 0 && (
                <div>
                    <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#1B9157]">
                        <CheckCircle2 className="w-4 h-4" />
                        Passed Checks ({passes.length})
                    </h4>
                    <ul className="space-y-2">
                        {passes.map((pass, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1 text-xs text-[#1B9157]">✓</span>
                                <span>{pass.replace('✅ ', '')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </ScrollArea>
);

const SeoScorecard: React.FC<SeoScorecardProps> = ({ analysis, focusKeywords }) => {
    return (
        <Card className="h-full border-l-4 border-l-primary">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                    <span>Optimization Score</span>
                    <Badge variant={analysis.overall >= 80 ? "default" : "secondary"}>
                        {analysis.overall}/100
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <ScoreRing
                        score={analysis.seo.score}
                        color="#3b82f6"
                        label="SEO (Google)"
                        icon={Search}
                    />
                    <ScoreRing
                        score={analysis.aeo.score}
                        color="#8b5cf6"
                        label="AEO (Voice)"
                        icon={Mic}
                    />
                    <ScoreRing
                        score={analysis.geo.score}
                        color="#10b981"
                        label="GEO (Insight)"
                        icon={Globe}
                    />
                </div>

                <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Readability Grade</span>
                        <span className="font-medium">{analysis.readability.grade}</span>
                    </div>
                    <Progress value={(analysis.readability.fleschKincaid / 18) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Flesch-Kincaid: {analysis.readability.fleschKincaid}</span>
                        <span>Target: 8-10</span>
                    </div>
                </div>

                <Tabs defaultValue="seo" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="aeo">AEO</TabsTrigger>
                        <TabsTrigger value="geo">GEO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="seo" className="mt-4">
                        <IssueList issues={analysis.seo.issues} passes={analysis.seo.passes} />
                    </TabsContent>

                    <TabsContent value="aeo" className="mt-4">
                        <div className="bg-muted/30 p-3 rounded-lg text-xs mb-4 border border-dashed">
                            "AEO optimizes for direct answers in Voice Search (Siri, Alexa). Focus on Q&A formats."
                        </div>
                        <IssueList issues={analysis.aeo.issues} passes={analysis.aeo.passes} />
                    </TabsContent>

                    <TabsContent value="geo" className="mt-4">
                        <div className="bg-muted/30 p-3 rounded-lg text-xs mb-4 border border-dashed">
                            "GEO optimizes for Generative search engines (ChatGPT, Gemini). Focus on authority & data."
                        </div>
                        <IssueList issues={analysis.geo.issues} passes={analysis.geo.passes} />
                    </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BarChart className="w-4 h-4" />
                        Keyword Density
                    </h4>
                    <div className="space-y-3">
                        {focusKeywords.map(kw => {
                            const data = analysis.keywordDensity[kw] || { count: 0, density: 0 };
                            return (
                                <div key={kw} className="bg-muted/50 p-2 rounded-md">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{kw}</span>
                                        <span className={data.density > 3 ? "text-red-500" : data.density < 0.5 ? "text-yellow-500" : "text-[#1B9157]"}>
                                            {data.density}% ({data.count})
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(100, (data.density / 3) * 100)}
                                        className={data.density > 3 ? "bg-red-100" : ""}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SeoScorecard;

