-- ATENÇÃO: este script apaga TODOS os registros atuais de public.livros.
-- Execute uma única vez no SQL Editor do Supabase para substituir o acervo.
-- Os preços são valores ilustrativos para demonstração; estoque começa zerado de empréstimos/vendas.

begin;

delete from public.livros;

insert into public.livros
    (titulo, autor, categoria, preco, estoque, emprestados, vendidos)
values
    ('Dom Casmurro', 'Machado de Assis', 'Ficção', 39.90, 5, 0, 0),
    ('A Revolução dos Bichos', 'George Orwell', 'Ficção', 34.90, 4, 0, 0),
    ('Harry Potter e a Pedra Filosofal', 'J. K. Rowling', 'Ficção', 49.90, 3, 0, 0),
    ('O Hobbit', 'J. R. R. Tolkien', 'Ficção', 44.90, 4, 0, 0),
    ('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Ficção', 29.90, 6, 0, 0),
    ('Sapiens: Uma Breve História da Humanidade', 'Yuval Noah Harari', 'História', 59.90, 3, 0, 0),
    ('Código Limpo (Clean Code)', 'Robert C. Martin', 'Tecnologia', 89.90, 2, 0, 0);

commit;
