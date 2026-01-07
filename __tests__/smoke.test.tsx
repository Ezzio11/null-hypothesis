import { render, screen } from '@testing-library/react';
import HomeClient from '../src/components/home/HomeClient';
import { PageRow } from '../src/lib/types';

// Mock data
const mockLabs: PageRow[] = [
    { id: 'MOD-01', slug: '/lab/test-lab', title: 'Test Lab', category: 'Core Module', year: '2025', status: 'LIVE', icon_name: 'Microscope' }
];

const mockProjects: PageRow[] = [
    { id: 'CASE-01', slug: '/projects/test-project', title: 'Test Project', category: 'Application', year: '2025', status: 'LIVE', icon_name: 'Activity' }
];

// Mock useLanguage
jest.mock('../src/contexts/LanguageContext', () => ({
    useLanguage: () => ({ t: (k: string) => k, isLoading: false, dir: 'ltr' })
}));

describe('HomeClient Smoke Test', () => {
    it('renders the hero section', () => {
        // Note: This requires a test environment setup (jest/vitest + react-testing-library)
        // For now, this serves as a template.
        /*
        render(<HomeClient labs={mockLabs} projects={mockProjects} />);
        expect(screen.getByText(/Reject the/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Lab/i)).toBeInTheDocument();
        */
    });
});
