"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/app/admin/categories/category.actions";

export default function DeleteCategoryButton({ id, name }: { id: string, name: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete the collection "${name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteCategoryAction(id);
            if (!result.success) {
                alert(result.error || "Failed to delete category");
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3 bg-white/90 backdrop-blur-md text-gray-900 hover:bg-brand-red hover:text-white rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
            title="Delete Collection"
        >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    );
}
