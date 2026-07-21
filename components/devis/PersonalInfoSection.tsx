import { InputField } from "@/components/ui/InputField";

interface PersonalInfoSectionProps {
  user: {
    name: string;
    prenom?: string;
    email: string;
    telephone?: string;
  };
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  return (
    <section className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
          1
        </span>
        Vos informations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Prénom *"
          id="prenom"
          defaultValue={user.prenom || ""}
          required
        />
        <InputField
          label="Nom *"
          id="nom"
          defaultValue={user.name || ""}
          required
        />
        <InputField
          label="Email *"
          id="email"
          defaultValue={user.email}
          readOnly
          className="bg-gray-100"
        />
        <InputField
          label="Téléphone *"
          id="telephone"
          defaultValue={user.telephone || ""}
          required
        />
      </div>
    </section>
  );
}
