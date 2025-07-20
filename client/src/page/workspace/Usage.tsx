import React from "react";

const Usage: React.FC = () => {
  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Руководство по использованию</h2>
          <p className="text-muted-foreground">
            Здесь вы найдете инструкции и советы по использованию платформы. Ознакомьтесь с основными возможностями, чтобы максимально эффективно работать в системе.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Usage; 