import React from 'react';
import { Container, Section } from '@/components/ui/layout';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const Terms = () => {
    return (
        <BeeYieldPageShell>
            <Container className="py-20">
                <Section>
                    <div className="max-w-4xl mx-auto prose">
                        <h1>Terms of Service</h1>
                        <p>Last updated: {new Date().toLocaleDateString()}</p>

                        <h2>1. Agreement to Terms</h2>
                        <p>By accessing our website and using our services, you agree to be bound by these Terms of Service.</p>

                        <h2>2. Intellectual Property</h2>
                        <p>The service and its original content, features, and functionality are and will remain the exclusive property of BeeYield and its licensors.</p>

                        <h2>3. User Accounts</h2>
                        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times.</p>

                        <h2>4. Limitation of Liability</h2>
                        <p>In no event shall BeeYield, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.</p>

                        <h2>5. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.</p>
                    </div>
                </Section>
            </Container>
        </BeeYieldPageShell>
    );
};

export default Terms;
