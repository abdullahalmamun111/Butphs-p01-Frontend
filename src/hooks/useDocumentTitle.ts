import { useEffect } from 'react';
import { SCHOOL_INFO } from '../config/school';

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | ${SCHOOL_INFO.shortName} — ${SCHOOL_INFO.nameBn}`
      : `${SCHOOL_INFO.nameEn} | ${SCHOOL_INFO.nameBn}`;
  }, [pageTitle]);
}
