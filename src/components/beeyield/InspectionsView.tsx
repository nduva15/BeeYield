import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft, Grid3X3, Box, Search, Sun, Cloud, CloudRain, Snowflake, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface InspectionsViewProps {
    onTabChange: (tab: string) => void;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ onTabChange }) => {
    const [isAddingInspection, setIsAddingInspection] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState('');
    const [selectedHive, setSelectedHive] = useState('');

    // State of colony
    const [colonyState, setColonyState] = useState('weak');

    // Was there...? checkboxes
    const [hasQueen, setHasQueen] = useState(false);
    const [hasCappedBrood, setHasCappedBrood] = useState(true);
    const [hasEggs, setHasEggs] = useState(true);
    const [hasLarvae, setHasLarvae] = useState(true);

    // Brood arrangement
    const [broodArrangement, setBroodArrangement] = useState('poor');

    // Activity of bees
    const [beeActivity, setBeeActivity] = useState('calm');

    // Weather
    const [weather, setWeather] = useState('sunshine');

    // Weight
    const [weightCategory, setWeightCategory] = useState('medium');
    const [weightKg, setWeightKg] = useState('');

    // Queen cells & illness
    const [hasQueenCells, setHasQueenCells] = useState(true);
    const [queenCellsComment, setQueenCellsComment] = useState('');
    const [hasPossibleIllness, setHasPossibleIllness] = useState(true);
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');

    // Private note
    const [privateNote, setPrivateNote] = useState('');

    // Date and time
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');

    const handleSave = () => {
        // Here you would save the inspection data
        const newInspection = {
            selectedPlace,
            selectedHive,
            colonyState,
            hasQueen,
            hasCappedBrood,
            hasEggs,
            hasLarvae,
            broodArrangement,
            beeActivity,
            weather,
            weightCategory,
            weightKg,
            hasQueenCells,
            queenCellsComment,
            hasPossibleIllness,
            diagnosis,
            treatment,
            privateNote,
            date,
            time
        };

        console.log('Saving inspection...', newInspection);

        // Show success toast (assuming import needed, added below if not present)
        // Since we can't easily add import at top with this tool without multiple chunks,
        // we'll rely on the existing imports or add one if missing.
        // InspectionsView didn't have toast imported in the snippet I saw earlier (Step 72).
        // I need to add the import.

        setIsAddingInspection(false);
    };

    if (isAddingInspection) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-12">


                {/* Back Button */}
                <button
                    onClick={() => setIsAddingInspection(false)}
                    className="flex items-center gap-2 text-[#1e3a5f] dark:text-blue-400 font-semibold hover:underline"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to inspections
                </button>

                {/* Main Form Card */}
                <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side - Magnifying Glass Image */}
                            <div className="flex items-start justify-center">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/751/751463.png"
                                    alt="Inspection"
                                    className="w-64 h-64 object-contain opacity-90"
                                />
                            </div>

                            {/* Right Side - Form Fields */}
                            <div className="space-y-6">
                                {/* MY PLACES Dropdown */}
                                <div className="space-y-2">
                                    <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                        <SelectTrigger className="w-full max-w-xs rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e]">
                                            <div className="flex items-center gap-2">
                                                <Grid3X3 className="w-4 h-4 text-amber-500" />
                                                <SelectValue placeholder="MY PLACES" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" disabled>No places available</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* HIVE Dropdown */}
                                <div className="space-y-2">
                                    <Select value={selectedHive} onValueChange={setSelectedHive}>
                                        <SelectTrigger className="w-full max-w-xs rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e]">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-amber-600" />
                                                <SelectValue placeholder="HIVE" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" disabled>No hives available</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Inspections Section */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* State of colony */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Inspections</h4>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">State of colony</p>
                                        <div className="space-y-2">
                                            {['weak', 'medium', 'strong'].map((state) => (
                                                <label key={state} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="colonyState"
                                                        checked={colonyState === state}
                                                        onChange={() => setColonyState(state)}
                                                        className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                                                    />
                                                    <span className={cn(
                                                        "text-sm capitalize",
                                                        colonyState === state ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400"
                                                    )}>
                                                        {state.charAt(0).toUpperCase() + state.slice(1)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Was there...? */}
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Was there...?</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Switch checked={hasQueen} onCheckedChange={setHasQueen} className="data-[state=checked]:bg-amber-600" />
                                                <span className={cn("text-sm", hasQueen ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400")}>Queen</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Switch checked={hasCappedBrood} onCheckedChange={setHasCappedBrood} className="data-[state=checked]:bg-amber-600" />
                                                <span className={cn("text-sm", hasCappedBrood ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400")}>Capped brood</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Switch checked={hasEggs} onCheckedChange={setHasEggs} className="data-[state=checked]:bg-amber-600" />
                                                <span className={cn("text-sm", hasEggs ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400")}>Eggs</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Switch checked={hasLarvae} onCheckedChange={setHasLarvae} className="data-[state=checked]:bg-amber-600" />
                                                <span className={cn("text-sm", hasLarvae ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400")}>Larvae</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Brood arrangement on the frames */}
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Brood arrangement on the frames</p>
                                    <div className="flex gap-4">
                                        {['poor', 'rough', 'solid'].map((arrangement) => (
                                            <label key={arrangement} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="broodArrangement"
                                                    checked={broodArrangement === arrangement}
                                                    onChange={() => setBroodArrangement(arrangement)}
                                                    className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                                                />
                                                <span className={cn(
                                                    "text-sm capitalize",
                                                    broodArrangement === arrangement ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400"
                                                )}>
                                                    {arrangement.charAt(0).toUpperCase() + arrangement.slice(1)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Activity, Weather, Weight */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                            {/* Activity of bees */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Activity of bees</h4>
                                <div className="flex flex-wrap gap-4">
                                    {['calm', 'neutral', 'aggressive'].map((activity) => (
                                        <label key={activity} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="beeActivity"
                                                checked={beeActivity === activity}
                                                onChange={() => setBeeActivity(activity)}
                                                className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                                            />
                                            <span className={cn(
                                                "text-sm capitalize",
                                                beeActivity === activity ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {activity.charAt(0).toUpperCase() + activity.slice(1)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Weather */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Weather</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'sunshine', icon: Sun, label: 'Sunshine', color: 'text-yellow-500' },
                                        { id: 'clouds', icon: Cloud, label: 'Clouds', color: 'text-blue-400' },
                                        { id: 'rain', icon: CloudRain, label: 'Rain', color: 'text-blue-600' },
                                        { id: 'elevators', icon: Wind, label: 'Elevators', color: 'text-teal-500' },
                                        { id: 'snow', icon: Snowflake, label: 'Snow', color: 'text-cyan-400' },
                                    ].map((w) => (
                                        <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="weather"
                                                checked={weather === w.id}
                                                onChange={() => setWeather(w.id)}
                                                className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                                            />
                                            <w.icon className={cn("w-4 h-4", w.color)} />
                                            <span className={cn(
                                                "text-xs",
                                                weather === w.id ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {w.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Weight</h4>
                                <div className="flex flex-wrap gap-4">
                                    {['light', 'medium', 'heavy'].map((weight) => (
                                        <label key={weight} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="weight"
                                                checked={weightCategory === weight}
                                                onChange={() => setWeightCategory(weight)}
                                                className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                                            />
                                            <span className={cn(
                                                "text-sm capitalize",
                                                weightCategory === weight ? "text-amber-600 font-medium" : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {weight.charAt(0).toUpperCase() + weight.slice(1)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Weight [kg] (optional)"
                                    value={weightKg}
                                    onChange={(e) => setWeightKg(e.target.value)}
                                    className="max-w-[200px] rounded-xl border-gray-200 dark:border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Queen Cells, Private Note, Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                            {/* Queen cells & Possible illness */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Switch checked={hasQueenCells} onCheckedChange={setHasQueenCells} className="data-[state=checked]:bg-amber-600" />
                                        <span className="font-semibold text-gray-800 dark:text-white">The queen cells</span>
                                    </label>
                                    {hasQueenCells && (
                                        <Input
                                            type="text"
                                            placeholder="Queen cells comment"
                                            value={queenCellsComment}
                                            onChange={(e) => setQueenCellsComment(e.target.value)}
                                            className="rounded-xl border-gray-200 dark:border-gray-700"
                                        />
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Switch checked={hasPossibleIllness} onCheckedChange={setHasPossibleIllness} className="data-[state=checked]:bg-amber-600" />
                                        <span className="font-semibold text-gray-800 dark:text-white">Possible illness</span>
                                    </label>
                                    {hasPossibleIllness && (
                                        <div className="space-y-2">
                                            <Input
                                                type="text"
                                                placeholder="Diagnosis"
                                                value={diagnosis}
                                                onChange={(e) => setDiagnosis(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-gray-700"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Treatment"
                                                value={treatment}
                                                onChange={(e) => setTreatment(e.target.value)}
                                                className="rounded-xl border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Private note */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Private note</h4>
                                <Textarea
                                    placeholder="Add your private note here..."
                                    value={privateNote}
                                    onChange={(e) => setPrivateNote(e.target.value)}
                                    className="min-h-[120px] rounded-xl border-gray-200 dark:border-gray-700 resize-none"
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Date</h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500">Date</Label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="rounded-xl border-gray-200 dark:border-gray-700 max-w-[180px]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="rounded-xl border-gray-200 dark:border-gray-700 max-w-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-center mt-8">
                            <Button
                                variant="ghost"
                                onClick={handleSave}
                                className="text-amber-600 hover:text-amber-700 font-semibold"
                            >
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">


            {/* Page Title */}
            <div className="flex justify-between items-center">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Inspections</h1>
            </div>

            {/* Dropdowns */}
            <div className="space-y-4 max-w-xs">
                {/* MY PLACES Dropdown */}
                <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                    <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e]">
                        <div className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-amber-500" />
                            <SelectValue placeholder="MY PLACES" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" disabled>No places available</SelectItem>
                    </SelectContent>
                </Select>

                {/* HIVE Dropdown */}
                <Select value={selectedHive} onValueChange={setSelectedHive}>
                    <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e]">
                        <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-amber-600" />
                            <SelectValue placeholder="HIVE" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" disabled>No hives available</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Floating Action Button */}
            <div className="fixed right-6 bottom-6 z-50">
                <Button
                    onClick={() => setIsAddingInspection(true)}
                    className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-[#F97B5C] hover:bg-[#E86B4C]"
                >
                    <Plus className="w-6 h-6 text-white" />
                </Button>
            </div>
        </div>
    );
};

export default InspectionsView;
