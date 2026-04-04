import type { FC } from 'react';
import ErrorPage from './ErrorPage';

const NotFoundPage: FC = () => {
  return (
    <ErrorPage
      title="Страница не найдена"
      message="Извините, запрашиваемая страница не существует или была перемещена."
      icon="🔍"
    />
  );
};

export default NotFoundPage;