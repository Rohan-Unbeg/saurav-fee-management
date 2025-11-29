import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdmissionForm from '@/components/AdmissionForm';

const Admission = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Admission</CardTitle>
        </CardHeader>
        <CardContent>
          <AdmissionForm 
            onSuccess={() => {
              navigate('/students');
            }}
            onCancel={() => {
              navigate('/');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Admission;


